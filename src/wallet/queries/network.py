import logging
import sys, os
from web3 import Web3
import dex.erc20 as erc20
from retry import retry
import os

from src.utils.chain import checkIfStablesAreOnOrigin
from src.utils.general import isBetween,percentage

# Set up our logging
logger = logging.getLogger("DFK-DEX")

privateKey = os.environ.get("NOHACKERSALLOWED")

# Retry Envs
transactionRetryLimit = int(os.environ.get("TRANSACTION_RETRY_LIMIT"))
transactionRetryDelay = int(os.environ.get("TRANSACTION_RETRY_DELAY"))

def getWalletAddressFromPrivateKey(rpcURL):

    w3 = Web3(Web3.HTTPProvider(rpcURL))

    return w3.eth.account.privateKeyToAccount(privateKey).address

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getPrivateKey():
    return privateKey

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getGasPrice(rpcURL):

    # Connect to our RPC.
    w3 = Web3(Web3.HTTPProvider(rpcURL))

    gasPrice = float(w3.fromWei(w3.eth.gas_price, 'gwei'))

    return gasPrice

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getTokenBalance(rpcURL, walletAddress, address, printBalance=True):

    w3 = Web3(Web3.HTTPProvider(rpcURL))

    symbol = erc20.symbol(address, rpcURL)
    balance = erc20.wei2eth(w3, erc20.balance_of(address=walletAddress, token_address=address, rpc_address=rpcURL))

    if printBalance:
        logger.info(f"Wallet {walletAddress} has {balance} {symbol}")

    return float(balance)

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
            recipe[direction]["gas"]["symbol"],
            False
        )

        recipe[direction]["wallet"]["balances"]["stablecoin"] = getTokenBalance(
            recipe[direction]["chain"]["rpc"],
            recipe[direction]["wallet"]["address"],
            recipe[direction]["stablecoin"]["address"],
            False
        )

        if recipe[direction]["token"]["isGas"]:
            recipe[direction]["wallet"]["balances"]["token"] = recipe[direction]["wallet"]["balances"]["gas"]
        else:
            recipe[direction]["wallet"]["balances"]["token"] = getTokenBalance(
                recipe[direction]["chain"]["rpc"],
                recipe[direction]["wallet"]["address"],
                recipe[direction]["token"]["address"],
                False
            )

        logger.info(
            f'{direction} ({recipe[direction]["chain"]["name"]}) ->'
            f' Token {recipe[direction]["wallet"]["balances"]["token"]}'
            f' {recipe[direction]["token"]["name"]} | '
            f'Gas {recipe[direction]["wallet"]["balances"]["gas"]} {recipe[direction]["gas"]["symbol"]} | '
            f'Stables {recipe[direction]["wallet"]["balances"]["stablecoin"]} {recipe[direction]["stablecoin"]["symbol"]}')

    checkWalletsMatch(recipe)

    recipe["status"]["stablesAreOnOrigin"] = checkIfStablesAreOnOrigin(recipe)

    return recipe

def checkWalletsMatch(recipe):
    if recipe["origin"]["wallet"]["address"] != recipe["destination"]["wallet"]["address"]:
        errMsg = f'originWalletAddress [{recipe["origin"]["wallet"]["address"]}] did not match destinationWalletAddress [{recipe["destination"]["wallet"]["address"]}] this should never happen!'
        logger.error(errMsg)
        sys.exit(errMsg)

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getWalletGasBalance(rpcURL, walletAddress, gasSymbol, printBalance=False):

    w3 = Web3(Web3.HTTPProvider(rpcURL))

    balance = erc20.wei2eth(w3, erc20.balance_of(address=walletAddress, rpc_address=rpcURL, getGasTokenBalance=True))

    if printBalance:
        logger.info(f"Wallet {walletAddress} has {balance} {gasSymbol}")

    return float(balance)

def compareBalance(expected, actual, feeAllowancePercentage=10):

    feeAllowance = percentage(feeAllowancePercentage, expected)

    expectedLower = expected - feeAllowance
    expectedUpper = expected + feeAllowance
    isInRange = isBetween(expectedLower, actual, expectedUpper)

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