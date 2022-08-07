import logging
import os
import sys
from decimal import Decimal

from retry import retry
from web3 import Web3

from src.utils.chain import checkIfStablesAreOnOrigin, checkWalletsMatch
from src.utils.general import isBetween, percentage, strToBool, getAWSSecret
from src.utils.wei import getTokenNormalValue

# Set up our logging
from src.wallet.contracts.erc20 import wei2eth, balance_of

logger = logging.getLogger("DFK-DEX")

privateKey = getAWSSecret(key="ARB_KEY")

# Retry Envs
transactionRetryLimit = int(os.environ.get("TRANSACTION_QUERY_RETRY_LIMIT"))
transactionRetryDelay = int(os.environ.get("TRANSACTION_QUERY_RETRY_DELAY"))

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getPrivateKey():
    return privateKey

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getMappedContractFunction(functionName, abiMapping):

    if functionName in abiMapping.keys():
        return abiMapping[functionName]
    else:
        sys.exit(f"No mapping for {functionName}!")

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def fillEmptyABIParams(abi, contractFunctionName):
    contractFunctionFields = {"inputs": [],
                              "name": "",
                              "outputs": [],
                              "statexMutability": "",
                              "type": ""}

    for abiFunction in abi:
        if "name" in abiFunction.keys():
            if abiFunction["name"] == contractFunctionName:
                functionToFix = abiFunction
                for fieldName, fieldReplacement in contractFunctionFields.items():
                    if fieldName not in functionToFix.keys():
                        functionToFix[fieldName] = fieldReplacement
                        break
                break

    return abi

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getNetworkWETH(rpcUrl, routerAddress, routerABI, routerABIMappings):
    from src.wallet.actions.network import callMappedContractFunction

    w3 = Web3(Web3.HTTPProvider(rpcUrl))

    wethFunctionName = getMappedContractFunction(functionName="WETH", abiMapping=routerABIMappings)
    routerABI = fillEmptyABIParams(abi=routerABI, contractFunctionName=wethFunctionName)

    contract_address = Web3.toChecksumAddress(routerAddress)
    contract = w3.eth.contract(contract_address, abi=routerABI)

    return callMappedContractFunction(contract=contract, functionToCall=wethFunctionName)

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
def getTokenBalance(rpcURL, tokenAddress, tokenDecimals, wethContractABI):
    walletAddress = getWalletAddressFromPrivateKey(rpcURL=rpcURL)

    balanceWei = balance_of(
        rpc_address=rpcURL,
        address=walletAddress,
        token_address=tokenAddress,
        wethContractABI=wethContractABI
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
            tokenDecimals=recipe[direction]["stablecoin"]["decimals"],
            wethContractABI=recipe[direction]["chain"]["contracts"]["weth"]["abi"]
        )

        tokenIsGas = strToBool(recipe[direction]["token"]["isGas"])

        if tokenIsGas:
            recipe[direction]["wallet"]["balances"]["token"] = recipe[direction]["wallet"]["balances"]["gas"]
        else:
            recipe[direction]["wallet"]["balances"]["token"] = getTokenBalance(
                rpcURL=recipe[direction]["chain"]["rpc"],
                tokenAddress=recipe[direction]["token"]["address"],
                tokenDecimals=recipe[direction]["token"]["decimals"],
                wethContractABI=recipe[direction]["chain"]["contracts"]["weth"]["abi"]
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
def getWalletGasBalance(rpcURL, walletAddress, wethContractABI):
    w3 = Web3(Web3.HTTPProvider(rpcURL))

    balance = wei2eth(w3, balance_of(address=walletAddress, rpc_address=rpcURL, wethContractABI=wethContractABI, getGasTokenBalance=True))

    return Decimal(balance)

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def compareBalance(expected, actual, feeAllowancePercentage=10):
    feeAllowance = percentage(feeAllowancePercentage, expected)

    expectedLower = expected - feeAllowance
    expectedUpper = expected + feeAllowance
    isInRange = isBetween(lowerLimit=expectedLower, middleNumber=actual, upperLimit=expectedUpper)

    if actual == expected or isInRange:
        return True
    else:
        return False
