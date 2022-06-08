import logging
import sys
from distutils import util
from web3 import Web3
import dex.uniswap_v2_router as market_place_router
import dex.erc20 as erc20
from retry import retry
from dotenv import load_dotenv


import os
import time

import helpers.Utils as Utils
import helpers.Bridge as BridgeAPI
import helpers.Data as Data

privateKey = os.environ.get("NOHACKERSALLOWED")

# Retry Envs
transactionRetryLimit = int(os.environ.get("TRANSACTION_RETRY_LIMIT"))
transactionRetryDelay = int(os.environ.get("TRANSACTION_RETRY_DELAY"))

# Set up our logging
logger = logging.getLogger("DFK-DEX")

def getWeiValue(amount, rpcURL):
    # Connect to our RPC.
    w3 = Web3(Web3.HTTPProvider(rpcURL))

    return erc20.eth2wei(w3, amount)

def getValueWithSlippage(amount, slippage=0.5):
    return int(format(amount - Utils.percentage(slippage, amount), f'.0f'))

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
def swapToken(tokenToSwapFrom, tokenToSwapTo, amountIn, amountOutMin, swappingToGas, rpcURL, explorerUrl, factoryAddress, routerAddress, justGetQuote=True, timeout=180, gwei=30):

    # Connect to our RPC.
    w3 = Web3(Web3.HTTPProvider(rpcURL))
    transactionTimeout = int(time.time() + timeout)

    # Get wallet address from private key.
    account_address = w3.eth.account.privateKeyToAccount(privateKey).address

    # Get the address of the token we to swap from.
    originTokenAddress = w3.toChecksumAddress(tokenToSwapFrom)

    amountOutWithSlippage = getValueWithSlippage(amountOutMin, 0.5)

    destinationTokenAddress = w3.toChecksumAddress(tokenToSwapTo)

    # WHEN SWAPPING TO GAS ALWAYS SWAP TO THE WRAPPED VERSION OF THE GAS TOKEN
    # EG: If going from JEWEL -> ONE go from JEWEL -> WONE
    result = market_place_router.swapTokensGeneric(
        justGetQuote=justGetQuote,
        swappingToGas=swappingToGas,
        amount_in=amountIn,
        amount_out_min=amountOutWithSlippage,
        path=[originTokenAddress, destinationTokenAddress],
        to=account_address,
        deadline=transactionTimeout,
        private_key=privateKey,
        nonce=w3.eth.getTransactionCount(account_address),
        gas_price_gwei=w3.fromWei(w3.eth.gas_price, 'gwei'),
        tx_timeout_seconds=transactionTimeout,
        rpc_address=rpcURL,
        factoryAddress=factoryAddress,
        routerAddress=routerAddress,
        explorerUrl=explorerUrl,
        logger=logger
    )

    return result

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getWalletAddressFromPrivateKey(rpcURL):

    w3 = Web3(Web3.HTTPProvider(rpcURL))

    return w3.eth.account.privateKeyToAccount(privateKey).address

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getPrivateKey():
    return privateKey

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getTokenBalance(rpcURL, walletAddress, address, printBalance=True):

    w3 = Web3(Web3.HTTPProvider(rpcURL))

    symbol = erc20.symbol(address, rpcURL)
    balance = erc20.wei2eth(w3, erc20.balance_of(address=walletAddress, token_address=address, rpc_address=rpcURL))

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

def topUpWalletGas(recipe, direction, toSwapFrom):

    minimumGasBalance = float(os.environ.get("MIN_GAS_BALANCE"))
    maximumGasBalance = float(os.environ.get("MAX_GAS_BALANCE"))

    fromAddress = recipe[direction][toSwapFrom]["address"]
    toAddress = recipe[direction]["gas"]["address"]

    gasBalance = recipe[direction]["wallet"]["balances"]["gas"]

    fromPrice = recipe[direction][toSwapFrom]["price"]
    gasPrice = recipe[direction]["gas"]["price"]

    fromBalanceValue = recipe[direction]["wallet"]["balances"][toSwapFrom] * fromPrice

    needsGas = gasBalance < minimumGasBalance

    if needsGas:
        gasTokensNeeded = maximumGasBalance - gasBalance
        topUpCost = gasTokensNeeded * gasPrice

        amountIn = topUpCost / fromPrice

        if topUpCost > fromBalanceValue:
            errMsg = f'Error topping up {direction} ({recipe[direction]["chain"]["name"]}) wallet with gas: Not enough stables (balance: {fromBalanceValue}) to purchase {gasTokensNeeded} {recipe[direction]["gas"]["symbol"]} for {topUpCost} {recipe[direction]["stablecoin"]["symbol"]}'
            logger.error(errMsg)
            sys.exit(errMsg)

        logger.info(f'{direction} wallet ({recipe[direction]["chain"]["name"]}) needs gas - adding {gasTokensNeeded} {recipe[direction]["gas"]["symbol"]} for {topUpCost} {recipe[direction]["stablecoin"]["symbol"]}')

        try:

            amountInWei = int(BridgeAPI.getTokenDecimalValue(amountIn, recipe[direction][toSwapFrom]["decimals"]))
            amountOutWei = int(BridgeAPI.getTokenDecimalValue(gasTokensNeeded, 18))

            swapToken(
                tokenToSwapFrom=fromAddress,
                tokenToSwapTo=toAddress,
                amountIn=amountInWei,
                amountOutMin=amountOutWei,
                swappingToGas=True,
                rpcURL=recipe[direction]["chain"]["rpc"],
                explorerUrl=recipe[direction]["chain"]["blockExplorer"],
                routerAddress=recipe[direction]["chain"]["uniswapRouter"],
                factoryAddress=recipe[direction]["chain"]["uniswapFactory"],
                justGetQuote=True
            )

        except Exception as err:
            errMsg = f'Error topping up {direction} ({recipe[direction]["chain"]["name"]}) wallet with gas: {err}'
            logger.error(errMsg)
            sys.exit(errMsg)

        recipe[direction]["wallet"]["balances"]["gas"] = getWalletGasBalance(
            recipe[direction]["chain"]["rpc"],
            recipe[direction]["wallet"]["address"],
            recipe[direction]["gas"]["symbol"],
            False
        )

        # Data.addFee(recipe=recipe, amount=float(transactionSummary["fee"]), section="originGas")

        logger.info(f'{direction} wallet ({recipe[direction]["chain"]["name"]}) topped up successful - new balance is {recipe[direction]["wallet"]["balances"]["gas"]} {recipe[direction]["gas"]["symbol"]}')
    else:
        logger.info(f"Origin wallet has enough gas")

    return recipe

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

def getSwapQuotes(recipe):

    swapDict = {
        "origin": "stablecoin",
        "destination": "token"
    }

    Utils.printSeperator()
    logger.info(f"[ARB #{recipe['info']['currentRoundTripCount']}] "
                f"Calculating Swap Fees For Arbitrage")
    Utils.printSeperator()



    for direction, toSwapFrom in swapDict.items():

        oppositeDirection = Utils.getOppositeDirection(direction)

        amountIn = 1
        amountOutNeeded = 1

        amountOfStables = recipe[direction]["wallet"]["balances"]["stablecoin"]
        amountOfTokens = amountOfStables / recipe[direction]["token"]["price"]

        if direction == "origin":
            toSwapTo = "token"
            amountToSwapFrom = amountOfStables
            amountToSwapTo = amountOfTokens
        else:
            toSwapTo = "stablecoin"
            amountToSwapFrom = amountOfTokens
            amountToSwapTo = amountOfStables

        fromAddress = recipe[direction][toSwapFrom]["address"]
        toAddress = recipe[direction][toSwapTo]["address"]

        amountInWei = int(BridgeAPI.getTokenDecimalValue(amountToSwapFrom, recipe[direction][toSwapFrom]["decimals"]))
        amountOutWei = int(BridgeAPI.getTokenDecimalValue(amountToSwapTo, recipe[direction][toSwapTo]["decimals"]))

        quote = swapToken(
            tokenToSwapFrom=fromAddress,
            tokenToSwapTo=toAddress,
            amountIn=amountInWei,
            amountOutMin=amountOutWei,
            swappingToGas=False,
            rpcURL=recipe[direction]["chain"]["rpc"],
            explorerUrl=recipe[direction]["chain"]["blockExplorer"],
            routerAddress=recipe[direction]["chain"]["uniswapRouter"],
            factoryAddress=recipe[direction]["chain"]["uniswapFactory"],
            justGetQuote=True
        )