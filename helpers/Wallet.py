import logging
import sys

from web3 import Web3
import dex.uniswap_v2_router as market_place_router
import dex.erc20 as erc20
from retry import retry
from dotenv import load_dotenv

load_dotenv()
import os
import signal
import time

import helpers.Utils as Utils

privateKey = os.environ.get("NOHACKERSALLOWED")

# Retry Envs
transactionRetryLimit = int(os.environ.get("TRANSACTION_RETRY_LIMIT"))
transactionRetryDelay = int(os.environ.get("TRANSACTION_RETRY_DELAY"))

# Set up our logging
logger = logging.getLogger("DFK-DEX")

# @retry(tries=0, delay=transactionRetryDelay, logger=logger)
def sendRawTransaction(rpcURL, bridgeTransaction):

    # Connect to our RPC.
    w3 = Web3(Web3.HTTPProvider(rpcURL))
    logger.info("Using RPC server " + rpcURL)

    try:
        signedTransaction = w3.eth.account.sign_transaction(bridgeTransaction, private_key=privateKey)
        sentTransaction = w3.eth.sendRawTransaction(signedTransaction.rawTransaction)
        return sentTransaction.hex()
    except ValueError as transactionError:
        logger.error(f"An error occured when sending bridge transaction: {transactionError}")
        raise

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getGasPrice(rpcURL):

    # Connect to our RPC.
    w3 = Web3(Web3.HTTPProvider(rpcURL))
    logger.info("Using RPC server " + rpcURL)

    gasPrice = float(w3.fromWei(w3.eth.gas_price, 'gwei'))

    return gasPrice

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def swapToken(tokenToSwapFrom, tokenToSwapTo, amountToSwap, rpcURL, chain, timeout=180, gwei=30):

    # Connect to our RPC.
    w3 = Web3(Web3.HTTPProvider(rpcURL))
    logger.info("Using RPC server " + rpcURL)
    transactionTimeout = int(time.time() + timeout)

    # Get wallet address from private key.
    account_address = w3.eth.account.privateKeyToAccount(privateKey).address

    # Get the address of the token we to swap from.
    originTokenAddress = erc20.symbol2address(tokenToSwapFrom, chain)

    # If we declare "GAS" as the token we want to swap to, will we the native gas token of
    # the chain eg. if were on Harmony, it would be ONE.
    if tokenToSwapTo == "GAS":
        destinationTokenAddress = market_place_router.weth(rpcURL)
        market_place_router.swap_exact_tokens_for_eth(
            amount_in=erc20.eth2wei(w3, amountToSwap),
            amount_out_min=60,
            path=[originTokenAddress, destinationTokenAddress],
            to=account_address,
            deadline=transactionTimeout,
            private_key=privateKey,
            nonce=w3.eth.getTransactionCount(account_address),
            gas_price_gwei=w3.fromWei(w3.eth.gas_price, 'gwei'),
            tx_timeout_seconds=transactionTimeout,
            rpc_address=rpcURL,
            logger=logger
        )

    # Otherwise we will swap the source token for the same amount of the destination token.
    else:
        destinationTokenAddress = erc20.symbol2address(tokenToSwapTo, chain)
        market_place_router.swap_exact_tokens_for_tokens(
            amount_in=erc20.eth2wei(w3, amountToSwap),
            amount_out_min=60,
            path=[originTokenAddress, destinationTokenAddress],
            to=account_address,
            deadline=transactionTimeout,
            private_key=privateKey,
            nonce=w3.eth.getTransactionCount(account_address),
            gas_price_gwei=w3.fromWei(w3.eth.gas_price, 'gwei'),
            tx_timeout_seconds=transactionTimeout,
            rpc_address=rpcURL,
            logger=logger
        )

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getWalletAddressFromPrivateKey(rpcURL):

    load_dotenv()


    w3 = Web3(Web3.HTTPProvider(rpcURL))

    return w3.eth.account.privateKeyToAccount(privateKey).address

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getTokenBalance(rpcURL, walletAddress, token, chain, printBalance=True):

    rpc_server = rpcURL
    if printBalance:
        logger.info("Using RPC Server " + rpc_server)

    w3 = Web3(Web3.HTTPProvider(rpc_server))

    token_address = token["address"]

    name = erc20.name(token_address, rpc_server)
    symbol = erc20.symbol(token_address, rpc_server)
    balance = erc20.wei2eth(w3, erc20.balance_of(walletAddress, token_address, rpc_server))

    if printBalance:
        logger.info(f"Wallet {walletAddress} has {balance} {symbol}")

    return float(balance)

def compareBalance(expected, actual, feeAllowancePercentage=10):

    feeAllowance = Utils.percentage(feeAllowancePercentage, expected)

    expectedLower = expected - feeAllowance
    expectedUpper = expected + feeAllowance
    isInRange = Utils.isBetween(expectedLower, actual, expectedUpper)

    if actual == expected or isInRange:
        return True
    else:
        return False

def getWalletBalances(arbitragePlan):

    originWalletTokenBalance = getTokenBalance(
        arbitragePlan["arbitrageOrigin"]["network"]["networkDetails"]["chainRPC"],
        arbitragePlan["arbitrageOrigin"]["walletAddress"],
        arbitragePlan["arbitrageOrigin"]["network"]['token'],
        arbitragePlan["arbitrageOrigin"]["network"]["networkDetails"]['chainName'],
        printBalance=False
    )

    destinationWalletTokenBalance = getTokenBalance(
        arbitragePlan["arbitrageDestination"]["network"]["networkDetails"]["chainRPC"],
        arbitragePlan["arbitrageDestination"]["walletAddress"],
        arbitragePlan["arbitrageDestination"]["network"]['token'],
        arbitragePlan["arbitrageDestination"]["network"]["networkDetails"]['chainName'],
        printBalance=False
    )

    return originWalletTokenBalance, destinationWalletTokenBalance

def waitForBridgeToComplete(arbitragePlan, timeout=600):

    timeoutMins = int(timeout / 60)

    directionMsg = Utils.camelCaseSplit(arbitragePlan["currentBridgeDirection"])[0].title() + " " + Utils.camelCaseSplit(arbitragePlan["currentBridgeDirection"])[1]

    if (arbitragePlan["currentBridgeDirection"] == "arbitrageOrigin"):
        toDirection = "arbitrageOrigin"
        returnDirection = "arbitrageDestination"
    else:
        toDirection = "arbitrageDestination"
        returnDirection = "arbitrageOrigin"

    amountSent = arbitragePlan[toDirection]["bridgeResult"]["AmountSent"]
    amountExpectedToReceive = arbitragePlan[returnDirection]["amountExpectedToReceive"]
    bridgeToken = arbitragePlan[returnDirection]["bridgeToken"]

    logger.info(f"Waiting for bridge to complete with a timeout of {timeoutMins} minutes")
    logger.info(f'Expecting {amountExpectedToReceive} {bridgeToken}')

    fundsBridged = False

    initOriginWalletTokenBalance, initDestinationWalletTokenBalance = getWalletBalances(arbitragePlan)

    expectedDestinationWalletTokenBalance = amountExpectedToReceive + initDestinationWalletTokenBalance

    minutesWaiting = 0
    secondSegment = 60

    startingTime = time.time()
    segmentTime = startingTime
    timeout = startingTime + timeout
    while True:
        test = 0

        if fundsBridged:
            bridgeTimedOut = False
            break

        if time.time() > timeout:
            bridgeTimedOut = True
            break

        test = test + 1

        originWalletTokenBalance, destinationWalletTokenBalance = getWalletBalances(arbitragePlan)

        fundsBridged = compareBalance(expectedDestinationWalletTokenBalance, destinationWalletTokenBalance)

        if time.time() - segmentTime > secondSegment:
            minutesWaiting = minutesWaiting + 1
            logger.info(f"{minutesWaiting} Mins Have Elapsed...")
            segmentTime = time.time()

        time.sleep(1)

    if fundsBridged:
        logger.info(f'Bridging {amountExpectedToReceive} {bridgeToken} was sucessfull!')
    elif bridgeTimedOut:
        logger.warning(f'Waiting for funds to bridge timed out - Bridging was unsucessfull!')
    x = 1

# testWallet = "0x919d17174Fb22CC1Cfc8748C208104EC62341791"
# balance = getTokenBalance(os.environ.get("HARMONY_MAIN_RPC"), testWallet, "JEWEL")
# x = 1
# swapToken(
#     tokenToSwapFrom="JEWEL",
#     tokenToSwapTo="GAS",
#     amountToSwap=23423423.00002502783,
#     rpcURL=os.environ.get("HARMONY_MAIN_RPC"),
#     privateKey=os.environ.get("NOHACKERSALLOWED"),
#     timeout=180,
#     gwei=30
# )

# swapToken(
#     tokenToSwapFrom="JEWEL",
#     tokenToSwapTo="GAS",
#     amountToSwap=23423423.00002502783,
#     rpcURL=os.environ.get("HARMONY_MAIN_RPC"),
#     privateKey=os.environ.get("NOHACKERSALLOWED"),
#     timeout=180,
#     gwei=30
# )