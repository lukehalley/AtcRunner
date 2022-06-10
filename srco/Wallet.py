import logging
import sys
from web3 import Web3
import dex.erc20 as erc20
from retry import retry
import os
import time

from srco import Utils, Bridge, Data

import dex.uniswap_v2_pair as Pair
import dex.uniswap_v2_factory as Factory
import dex.uniswap_v2_router as Router

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

# @retry(tries=0, delay=transactionRetryDelay, logger.py=logger.py)
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

# @retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger.py=logger.py)
def swapToken(tokenToSwapFrom, tokenToSwapTo, amountIn, swappingToGas, rpcURL, explorerUrl, factoryAddress, routerAddress, amountOutMin=0, timeout=180, gwei=30):

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
    result = Router.swapTokens(
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

            amountInWei = int(Bridge.getTokenDecimalValue(amountIn, recipe[direction][toSwapFrom]["decimals"]))
            amountOutWei = int(Bridge.getTokenDecimalValue(gasTokensNeeded, 18))

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

    readableTo = toDirection.replace("data", "")
    readableFrom = returnDirection.replace("data", "")

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

        fundsBridged = bool(Bridge.checkBridgeStatus(originChainID, transactionID)["isComplete"])

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

def getOnChainPrice(recipe):

    priceDict = {
        "chainOne": 0,
        "chainTwo": 0
    }

    Utils.printSeperator()
    logger.info(f"Getting on chain price for tokens")
    Utils.printSeperator()

    for position, price in priceDict.items():

        if position == "chainTwo":
            x = 1

        fromAddress = recipe[position]["token"]["address"]
        toAddress = recipe[position]["stablecoin"]["address"]

        amountInWei = int(Bridge.getTokenDecimalValue(1, recipe[position]["token"]["decimals"]))

        amountOutWei = swapToken(
            tokenToSwapFrom=fromAddress,
            tokenToSwapTo=toAddress,
            amountIn=amountInWei,
            swappingToGas=False,
            rpcURL=recipe[position]["chain"]["rpc"],
            explorerUrl=recipe[position]["chain"]["blockExplorer"],
            routerAddress=recipe[position]["chain"]["uniswapRouter"],
            factoryAddress=recipe[position]["chain"]["uniswapFactory"],
            justGetQuote=True
        )

        priceDict[position] = float(Bridge.getTokenNormalValue(amountOutWei, recipe[position]["stablecoin"]["decimals"]))

        x = 1

    return priceDict["chainOne"], priceDict["chainTwo"]

def getSwapQuotes(recipe):

    swapDict = {
        "tripOne": {
            "toSwapFrom": "stablecoin",
            "position": "origin"
        },
        "tripTwo": {
            "toSwapFrom": "token",
            "position": "destination"
        },
        "tripThree": {
            "toSwapFrom": "stablecoin",
            "position": "origin"
        },
    }

    Utils.printSeperator()
    logger.info(f"[ARB #{recipe['info']['currentRoundTripCount']}] "
                f"Calculating Swap Fees For Arbitrage")
    Utils.printSeperator()

    swapFees = {}

    for tripNumber, settings in swapDict.items():

        position = settings["position"]
        toSwapFrom = settings["toSwapFrom"]

        amountOfStables = recipe[position]["wallet"]["balances"]["stablecoin"]
        amountOfTokens = amountOfStables / recipe[position]["token"]["price"]

        if position == "origin":

            toSwapTo = "token"
            logger.info(f'Estimate: {amountOfStables} {recipe[position][toSwapFrom]["name"]} -> {amountOfTokens} {recipe[position][toSwapTo]["name"]}')
            amountToSwapFrom = amountOfStables
            amountToSwapTo = amountOfTokens
        else:
            toSwapTo = "stablecoin"
            logger.info(f'Estimate: {amountOfTokens} {recipe[position][toSwapFrom]["name"]} -> {amountOfStables} {recipe[position][toSwapTo]["name"]}')
            amountToSwapFrom = amountOfTokens
            amountToSwapTo = amountOfStables

        fromAddress = recipe[position][toSwapFrom]["address"]
        toAddress = recipe[position][toSwapTo]["address"]

        amountInWei = int(Bridge.getTokenDecimalValue(amountToSwapFrom, recipe[position][toSwapFrom]["decimals"]))
        amountOutWei = int(Bridge.getTokenDecimalValue(amountToSwapTo, recipe[position][toSwapTo]["decimals"]))

        quote = swapToken(
            tokenToSwapFrom=fromAddress,
            tokenToSwapTo=toAddress,
            amountIn=amountInWei,
            amountOutMin=amountOutWei,
            swappingToGas=False,
            rpcURL=recipe[position]["chain"]["rpc"],
            explorerUrl=recipe[position]["chain"]["blockExplorer"],
            routerAddress=recipe[position]["chain"]["uniswapRouter"],
            factoryAddress=recipe[position]["chain"]["uniswapFactory"],
            justGetQuote=True
        )

        quoteRealValue = float(Bridge.getTokenNormalValue(quote, recipe[position][toSwapTo]["decimals"]))

        swapFees[tripNumber] = {}

        if position == "origin":
            swapFees[tripNumber] = amountToSwapFrom - (quoteRealValue * recipe[position][toSwapTo]["price"])
        else:
            swapFees[tripNumber] = amountToSwapFrom - (quoteRealValue / recipe[position][toSwapFrom]["price"])

        tokenLoss = amountToSwapTo - quoteRealValue
        estimatedOutput = quoteRealValue

        logger.info(f'Output: {quoteRealValue} {recipe[position][toSwapTo]["name"]} w/ fee: ${swapFees[tripNumber]}')

        Utils.printSeperator()

    recipe = Data.addFee(recipe=recipe, fee=swapFees, section="swap")

    logger.info(f"Swap Fees Total: ${recipe['status']['fees']['swap']['subTotal']}")

    return recipe

def generateBlockExplorerLink(url, txid):
    return url + "/" + str(txid)

def swapTokens(swappingToGas, amount_in, amount_out_min, path, to, deadline, private_key, nonce, gas_price_gwei, tx_timeout_seconds, rpc_address, factoryAddress, routerAddress, explorerUrl, logger, gas=250000):
    w3 = Web3(Web3.HTTPProvider(rpc_address))
    account = w3.eth.account.privateKeyToAccount(private_key)
    w3.eth.default_account = account.address

    ABI = Utils.getABI("IUniswapV2Router02.json")

    contract = w3.eth.contract(routerAddress, abi=ABI)

    txParams = {
        'gasPrice': w3.toWei(gas_price_gwei, 'gwei'),
        'nonce': nonce,
        'gas': gas
    }

    if swappingToGas:
        tx = contract.functions.swapExactTokensForETH(amount_in, amount_out_min, path, to, deadline).buildTransaction(txParams)
    else:
        tx = contract.functions.swapExactTokensForTokens(amount_in, amount_out_min, path, to, deadline).buildTransaction(txParams)

    logger.debug("Signing transaction...")
    signed_tx = w3.eth.account.sign_transaction(tx, private_key=private_key)
    logger.debug("Transaction signed!")

    logger.info("Sending transaction...")
    w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    logger.info("Transaction successfully sent!")

    logger.info("Waiting for transaction to be mined...")
    tx_receipt = w3.eth.wait_for_transaction_receipt(transaction_hash=signed_tx.hash, timeout=tx_timeout_seconds,
                                                     poll_latency=2)

    explorerLink = generateBlockExplorerLink(explorerUrl, signed_tx.hash.hex())
    logger.info(f"Transaction was mined: {explorerLink}")

    txWasSuccessful = tx_receipt["status"] == 1

    if txWasSuccessful:
        logger.info(f"✅ Transaction was successful: {explorerLink}")

        result = {
            "successfull": txWasSuccessful,
            "fee": Bridge.getTokenNormalValue(tx_receipt["gasUsed"] * w3.toWei(gas_price_gwei, 'gwei'), 18),
            "blockURL": explorerLink,
            "hash": signed_tx.hash.hex()
        }

    else:
        errMsg = f'⛔️ Transaction was unsuccessful: {explorerLink}'
        logger.error(errMsg)
        sys.exit(errMsg)

    return result

def getQuoteIn(amount_in, path, private_key, rpc_address, factoryAddress, routerAddress):
    w3 = Web3(Web3.HTTPProvider(rpc_address))
    account = w3.eth.account.privateKeyToAccount(private_key)
    w3.eth.default_account = account.address

    one = Web3.toChecksumAddress(path[0])
    two = Web3.toChecksumAddress(path[1])
    pairAddress = Factory.get_pair(token_address_1=one, token_address_2=two, rpc_address=rpc_address,
                                   factoryAddress=factoryAddress)

    pairReserves = Pair.get_reserves(pairAddress, rpc_address)

    result = Router.get_amount_out(
        amount_in=amount_in,
        reserve_in=pairReserves[0],
        reserve_out=pairReserves[1],
        rpc_address=rpc_address,
        routerAddress=routerAddress
    )

    return result

def getQuote(amount_in, path, private_key, rpc_address, factoryAddress, routerAddress):
    w3 = Web3(Web3.HTTPProvider(rpc_address))
    account = w3.eth.account.privateKeyToAccount(private_key)
    w3.eth.default_account = account.address

    one = Web3.toChecksumAddress(path[0])
    two = Web3.toChecksumAddress(path[1])
    pairAddress = Factory.get_pair(token_address_1=one, token_address_2=two, rpc_address=rpc_address,
                                   factoryAddress=factoryAddress)

    pairReserves = Pair.get_reserves(pairAddress, rpc_address)

    result = Router.get_amount_out(
        amount_in=amount_in,
        reserve_in=pairReserves[0],
        reserve_out=pairReserves[1],
        rpc_address=rpc_address,
        routerAddress=routerAddress
    )

    return result