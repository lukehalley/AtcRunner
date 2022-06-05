import logging
import sys
from distutils import util
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
import helpers.Bridge as BridgeAPI

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

    gasPrice = float(w3.fromWei(w3.eth.gas_price, 'gwei'))

    return gasPrice

# @retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def swapToken(tokenToSwapFrom, tokenToSwapTo, amountToSwap, rpcURL, chain, timeout=180, gwei=30):

    # Connect to our RPC.
    w3 = Web3(Web3.HTTPProvider(rpcURL))
    transactionTimeout = int(time.time() + timeout)

    # Get wallet address from private key.
    account_address = w3.eth.account.privateKeyToAccount(privateKey).address

    # Get the address of the token we to swap from.
    originTokenAddress = w3.toChecksumAddress(tokenToSwapFrom)
    destinationTokenAddress = w3.toChecksumAddress(tokenToSwapTo)

    # If we declare "GAS" as the token we want to swap to, will we the native gas token of
    # the chain eg. if were on Harmony, it would be ONE.
    if tokenToSwapTo == "GAS":
        destinationTokenAddress = market_place_router.weth(rpcURL)
        tx_receipt = market_place_router.swap_exact_tokens_for_eth(
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
        tx_receipt = market_place_router.swap_exact_tokens_for_tokens(
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

    return tx_receipt

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getWalletAddressFromPrivateKey(rpcURL):

    load_dotenv()

    w3 = Web3(Web3.HTTPProvider(rpcURL))

    return w3.eth.account.privateKeyToAccount(privateKey).address

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getPrivateKey():
    return privateKey

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getTokenBalance(rpcURL, walletAddress, tokenAddress, printBalance=True):

    w3 = Web3(Web3.HTTPProvider(rpcURL))

    symbol = erc20.symbol(tokenAddress, rpcURL)
    balance = erc20.wei2eth(w3, erc20.balance_of(address=walletAddress, token_address=tokenAddress, rpc_address=rpcURL))

    if printBalance:
        logger.info(f"Wallet {walletAddress} has {balance} {symbol}")

    return float(balance)

def checkWalletsMatch(recipe):
    if recipe["origin"]["wallet"]["address"] != recipe["destination"]["wallet"]["address"]:
        errMsg = f'originWalletAddress [{recipe["origin"]["wallet"]["address"]}] did not match destinationWalletAddress [{recipe["destination"]["wallet"]["address"]}] this should never happen!'
        logger.error(errMsg)
        sys.exit(errMsg)

def checkIfStablesAreOnOrigin(recipe):
    return recipe["origin"]["wallet"]["balances"]["stablecoin"] > recipe["destination"]["wallet"]["balances"]["stablecoin"]

def getWalletsInformation(recipe):

    directionList = ("origin", "destination")

    recipe["status"] = {}

    for direction in directionList:

        recipe[direction]["wallet"] = {}

        recipe[direction]["wallet"]["address"] = getWalletAddressFromPrivateKey(recipe[direction]["chain"]["rpc"])

        recipe[direction]["wallet"]["balances"] = {}

        recipe[direction]["wallet"]["balances"]["gas"] = getWalletGasBalance(
            recipe[direction]["chain"]["rpc"],
            recipe[direction]["wallet"]["address"],
            recipe[direction]["chain"]["token"],
            False
        )

        recipe[direction]["wallet"]["balances"]["stablecoin"] = getTokenBalance(
            recipe[direction]["chain"]["rpc"],
            recipe[direction]["wallet"]["address"],
            recipe[direction]["stablecoin"]["tokenAddress"],
            False
        )

        if recipe[direction]["token"]["isGas"]:
            recipe[direction]["wallet"]["balances"]["token"] = recipe[direction]["wallet"]["balances"]["gas"]
        else:
            recipe[direction]["wallet"]["balances"]["token"] = getTokenBalance(
                recipe[direction]["chain"]["rpc"],
                recipe[direction]["wallet"]["address"],
                recipe[direction]["token"]["tokenAddress"],
                False
            )

        logger.info(
            f'{direction} ({recipe[direction]["chain"]["name"]}) ->'
            f' Token {recipe[direction]["wallet"]["balances"]["token"]}'
            f' {recipe[direction]["token"]["name"]} | '
            f'Gas {recipe[direction]["wallet"]["balances"]["gas"]} {recipe[direction]["chain"]["token"]} | '
            f'Stables {recipe[direction]["wallet"]["balances"]["stablecoin"]} {recipe[direction]["stablecoin"]["symbol"]}')

    checkWalletsMatch(recipe)

    recipe["status"]["stablesAreOnOrigin"] = checkIfStablesAreOnOrigin(recipe)

    return recipe

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getWalletGasBalance(rpcURL, walletAddress, gasSymbol, printBalance=False):

    w3 = Web3(Web3.HTTPProvider(rpcURL))

    balance = erc20.wei2eth(w3, erc20.balance_of(address=walletAddress, rpc_address=rpcURL, getGasTokenBalance=True))

    if printBalance:
        logger.info(f"Wallet {walletAddress} has {balance} {gasSymbol}")

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

def checkWalletsGas(recipe):
    minimumGasBalance = float(os.environ.get("MIN_GAS_BALANCE"))
    maximumGasBalance = float(os.environ.get("MAX_GAS_BALANCE"))

    directions = ("origin", "destination")

    for direction in directions:

        gasBalance = recipe[direction]["wallet"]["balances"]["gas"]
        stableBalance = recipe[direction]["wallet"]["balances"]["stablecoin"]
        needsGas = gasBalance < minimumGasBalance

        if needsGas:
            gasTokensNeeded = maximumGasBalance - gasBalance
            topUpCost = gasTokensNeeded * recipe[direction]["token"]["price"]

            if topUpCost > stableBalance:
                errMsg = f'Error topping up {direction} ({recipe[direction]["chain"]["name"]}) wallet with gas: Not enough stables (balance: {stableBalance}) to purchase {gasTokensNeeded} {recipe[direction]["chain"]["token"]} for {topUpCost} {recipe[direction]["stablecoin"]["symbol"]}'
                logger.error(errMsg)
                sys.exit(errMsg)

            logger.info(f'{direction} wallet ({recipe[direction]["chain"]["name"]}) needs gas - adding {gasTokensNeeded} {recipe[direction]["chain"]["token"]} for {topUpCost} {recipe[direction]["stablecoin"]["symbol"]}')

            try:
                topUpReceipt = swapToken(
                    recipe[direction]["stablecoin"]["tokenAddress"],
                    "GAS",
                    topUpCost,
                    recipe[direction]["chain"]["rpc"],
                    recipe[direction]["chain"]["name"]
                )
            except Exception as err:
                errMsg = f'Error topping up {direction} ({recipe[direction]["chain"]["name"]}) wallet with gas: {err}'
                logger.error(errMsg)
                sys.exit(errMsg)

            newBalance = getWalletGasBalance(recipe[direction]["chain"]["rpc"], recipe[direction]["chain"]["token"], False)

            logger.info(f'{direction} wallet ({recipe[direction]["chain"]["name"]}) topped up - new balance is {newBalance} {recipe[direction]["stablecoin"]["symbol"]}')

        else:
            logger.info(f'{direction} wallet ({recipe[direction]["chain"]["name"]}) already has a sufficient gas balance of {gasBalance} {recipe[direction]["chain"]["token"]}')

    Utils.printSeperator()

def waitForBridgeToComplete(arbitragePlan, bridgeTimeout=10, waitForFundsTimeout=10):

    timeoutMins = int(bridgeTimeout / 60)

    directionMsg = Utils.camelCaseSplit(arbitragePlan["currentBridgeDirection"])[0].title() + " " + Utils.camelCaseSplit(arbitragePlan["currentBridgeDirection"])[1]

    if (arbitragePlan["currentBridgeDirection"] == "arbitrageOrigin"):
        toDirection = "arbitrageOrigin"
        returnDirection = "arbitrageDestination"
    else:
        toDirection = "arbitrageDestination"
        returnDirection = "arbitrageOrigin"

    readableTo = toDirection.replace("arbitrage", "")
    readableFrom = returnDirection.replace("arbitrage", "")

    originChainID = arbitragePlan[toDirection]["bridgeResult"]["TransactionObject"]["chainId"]
    transactionID = arbitragePlan[toDirection]["bridgeResult"]["ID"]

    amountSent = arbitragePlan[toDirection]["bridgeResult"]["AmountSent"]
    amountExpectedToReceive = arbitragePlan[returnDirection]["amountExpectedToReceive"]
    bridgeToken = arbitragePlan[returnDirection]["bridgeToken"]

    logger.info(f"Waiting for bridge from {readableTo} -> {readableFrom} complete with a timeout of {timeoutMins} minute(s)...")
    logger.info(f'Expecting {amountExpectedToReceive} {bridgeToken}')

    preOriginWalletTokenBalance, preDestinationWalletTokenBalance = getWalletBalances(arbitragePlan)

    minutesWaiting = 0
    secondSegment = 60

    startingTime = time.time()
    segmentTime = startingTime
    bridgeTimeout = startingTime + bridgeTimeout
    while True:

        fundsBridged = bool(BridgeAPI.checkBridgeStatus(originChainID, transactionID)["isComplete"])

        if fundsBridged:
            bridgeTimedOut = False
            break

        if time.time() > bridgeTimeout:
            bridgeTimedOut = True
            break

        if time.time() - segmentTime > secondSegment:
            minutesWaiting = minutesWaiting + 1
            logger.info(f"{minutesWaiting} Mins Have Elapsed...")
            segmentTime = time.time()

        time.sleep(1)

    fundsBridged = True

    if fundsBridged:
        logger.info(f'Bridging {amountExpectedToReceive} {bridgeToken} from {readableTo} -> {readableFrom} was successfull!')
    elif bridgeTimedOut:
        errMsg = f'Waiting for bridge {readableTo} -> {readableFrom} to complete exceeded time out limit of {timeoutMins} minute(s) - Bridging was unsucessfull!'
        logger.error(errMsg)
        sys.exit(errMsg)
    else:
        errMsg = f'Waiting for bridge {readableTo} -> {readableFrom} failed in an unknown state, this should not happen!'
        logger.error(errMsg)
        sys.exit(errMsg)

    Utils.printSeperator()

    postOriginWalletTokenBalance, postDestinationWalletTokenBalance = getWalletBalances(arbitragePlan)

    fundsInWallet = False
    waitForFundsTimedOut = False

    logger.info(f'Waiting for funds to hit the {readableFrom} wallet...')

    fundsInWallet = True

    minutesWaiting = 0
    startingTime = time.time()
    segmentTime = startingTime
    waitForFundsTimeout = startingTime + waitForFundsTimeout
    while not fundsInWallet:

        if postDestinationWalletTokenBalance > preDestinationWalletTokenBalance:
            fundsInWallet = True

        postOriginWalletTokenBalance, postDestinationWalletTokenBalance = getWalletBalances(arbitragePlan)

        if fundsInWallet:
            waitForFundsTimedOut = False
            break

        if time.time() > waitForFundsTimeout:
            waitForFundsTimedOut = True
            break

        if time.time() - segmentTime > secondSegment:
            minutesWaiting = minutesWaiting + 1
            logger.info(f"{minutesWaiting} Mins Have Elapsed...")
            segmentTime = time.time()

        time.sleep(1)

    if fundsInWallet:

        amountActuallySent = abs(preOriginWalletTokenBalance - postOriginWalletTokenBalance)

        amountActuallyRecieved = abs(postDestinationWalletTokenBalance - preDestinationWalletTokenBalance)

        logger.info(f'Bridged funds have been confirmed to have hit {readableFrom} wallet')
        logger.info(f'Actual amount sent was {amountActuallySent} {bridgeToken}')
        logger.info(f'Actual amount received was {amountExpectedToReceive} {bridgeToken}')

        return amountActuallySent, amountActuallyRecieved

    elif waitForFundsTimedOut:
        errMsg = f'Waiting for funds to hit {readableFrom} wallet exceeded time out limit of {timeoutMins} minute(s) - Funds did not hit wallet as expected!'
        logger.error(errMsg)
        sys.exit(errMsg)
    else:
        errMsg = f'Waiting for funds to hit {readableFrom} wallet failed in an unknown state, this should not happen!'
        logger.error(errMsg)
        sys.exit(errMsg)
