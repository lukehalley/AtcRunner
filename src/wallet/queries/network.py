import logging
import os
from decimal import Decimal

from retry import retry
from web3 import Web3

from src.dex.erc20 import balance_of, wei2eth
from src.utils.chain import checkIfStablesAreOnOrigin, checkWalletsMatch
from src.utils.general import isBetween, percentage, strToBool, getAWSSecret
from src.utils.wei import getTokenNormalValue

# Set up our logging
logger = logging.getLogger("DFK-DEX")

# privateKey = json.loads(os.environ.get("ARB_KEY"))["ARB_KEY"]
privateKey = getAWSSecret(key="ARB_KEY")

# Retry Envs
transactionRetryLimit = int(os.environ.get("TRANSACTION_QUERY_RETRY_LIMIT"))
transactionRetryDelay = int(os.environ.get("TRANSACTION_QUERY_RETRY_DELAY"))

def getPrivateKey():
    return privateKey

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getWalletAddressFromPrivateKey(rpcURL):

    w3 = Web3(Web3.HTTPProvider(rpcURL))

    return w3.eth.account.privateKeyToAccount(privateKey).address

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getGasPrice(rpcURL):

    # Connect to our RPC.
    w3 = Web3(Web3.HTTPProvider(rpcURL))

    gasPrice = Decimal(w3.fromWei(w3.eth.gas_price, 'gwei'))

    return gasPrice

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getTokenBalance(rpcURL, tokenAddress, tokenDecimals):

    walletAddress = getWalletAddressFromPrivateKey(rpcURL=rpcURL)

    balanceWei = balance_of (
                rpc_address=rpcURL,
                address=walletAddress,
                token_address=tokenAddress
        )

    balance = getTokenNormalValue(amount=balanceWei, decimalPlaces=tokenDecimals)

    return Decimal(balance)

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getWalletsInformation(recipe, printBalances=False):

    directionList = ("origin", "destination")

    if not "status" in recipe:
        recipe["status"] = {}

    for direction in directionList:

        recipe[direction]["wallet"] = {}

        recipe[direction]["wallet"]["address"] = getWalletAddressFromPrivateKey(recipe[direction]["chain"]["rpc"])

        recipe[direction]["wallet"]["balances"] = {}

        recipe[direction]["wallet"]["balances"]["gas"] = getWalletGasBalance(
            recipe[direction]["chain"]["rpc"],
            recipe[direction]["wallet"]["address"]
        )

        recipe[direction]["wallet"]["balances"]["stablecoin"] = getTokenBalance(
            rpcURL=recipe[direction]["chain"]["rpc"],
            tokenAddress=recipe[direction]["stablecoin"]["address"],
            tokenDecimals=recipe[direction]["stablecoin"]["decimals"]
        )

        tokenIsGas = strToBool(recipe[direction]["token"]["isGas"])

        if tokenIsGas:
            recipe[direction]["wallet"]["balances"]["token"] = recipe[direction]["wallet"]["balances"]["gas"]
        else:
            recipe[direction]["wallet"]["balances"]["token"] = getTokenBalance(
                rpcURL=recipe[direction]["chain"]["rpc"],
                tokenAddress=recipe[direction]["token"]["address"],
                tokenDecimals=recipe[direction]["token"]["decimals"]
            )

        if printBalances:
            logger.info(
                f'{direction.title()} ({recipe[direction]["chain"]["name"]}): '
                f'Token {round(recipe[direction]["wallet"]["balances"]["token"], 6)} {recipe[direction]["token"]["name"]} | '
                f'Gas {round(recipe[direction]["wallet"]["balances"]["gas"], 6)} {recipe[direction]["gas"]["symbol"]} | '
                f'Stables {round(recipe[direction]["wallet"]["balances"]["stablecoin"], 6)} {recipe[direction]["stablecoin"]["symbol"]}'
            )

    checkWalletsMatch(recipe)

    recipe["status"]["stablesAreOnOrigin"] = checkIfStablesAreOnOrigin(recipe)

    return recipe

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getWalletGasBalance(rpcURL, walletAddress):

    w3 = Web3(Web3.HTTPProvider(rpcURL))

    balance = wei2eth(w3, balance_of(address=walletAddress, rpc_address=rpcURL, getGasTokenBalance=True))

    # if printBalance:
    #     logger.info(f"Wallet {walletAddress} has {balance} {gasSymbol}")

    return Decimal(balance)

def compareBalance(expected, actual, feeAllowancePercentage=10):

    feeAllowance = percentage(feeAllowancePercentage, expected)

    expectedLower = expected - feeAllowance
    expectedUpper = expected + feeAllowance
    isInRange = isBetween(lowerLimit=expectedLower, middleNumber=actual, upperLimit=expectedUpper)

    if actual == expected or isInRange:
        return True
    else:
        return False