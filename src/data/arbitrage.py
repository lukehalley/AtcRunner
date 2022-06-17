import os, sys, logging
from itertools import repeat
from collections import OrderedDict

from src.utils.general import strToBool, printSeperator, percentageDifference, prependToOrderedDict, printArbitrageResult
from src.utils.chain import getOppositeDirection, getJSONFile, getValueWithSlippage, addressToChecksumAddress

from src.wallet.queries.swap import getSwapQuoteOut
from src.wallet.actions.swap import swapToken
from src.wallet.actions.bridge import executeBridge

from src.api.synapsebridge import estimateBridgeOutput
from src.wallet.actions.network import topUpWalletGas
from src.api.telegrambot import appendToMessage, updatedStatusMessage

# Set up our logging
logger = logging.getLogger("DFK-DEX")

# Determine our arbitrage strategy
def determineArbitrageStrategy(recipe):

    logger.debug(f"Calling Dexscreener API to find current price of pair")

    # chainOneTokenPrice = getTokenPriceByDexId(recipe["chainOne"]["chain"]["name"], recipe["chainOne"]["token"]["address"], recipe["arbitrage"]["dexId"])
    # chainTwoTokenPrice = getTokenPriceByDexId(recipe["chainTwo"]["chain"]["name"], recipe["chainTwo"]["token"]["address"], recipe["arbitrage"]["dexId"])
    # chainOneGasPrice = getTokenPriceByDexId(recipe["chainOne"]["chain"]["name"], recipe["chainOne"]["gas"]["address"], recipe["arbitrage"]["dexId"])
    # chainTwoGasPrice = getTokenPriceByDexId(recipe["chainTwo"]["chain"]["name"], recipe["chainTwo"]["gas"]["address"], recipe["arbitrage"]["dexId"])

    chainOneTokenPrice = getSwapQuoteOut(
        amountInNormal=1.0,
        amountInDecimals=recipe["chainOne"]["token"]["decimals"],
        amountOutDecimals=recipe["chainOne"]["stablecoin"]["decimals"],
        rpcUrl=recipe["chainOne"]["chain"]["rpc"],
        routerAddress=recipe["chainOne"]["chain"]["uniswapRouter"],
        routes=[recipe["chainOne"]["token"]["address"], recipe["chainOne"]["stablecoin"]["address"]]
    )

    chainTwoTokenPrice = getSwapQuoteOut(
        amountInNormal=1.0,
        amountInDecimals=recipe["chainTwo"]["token"]["decimals"],
        amountOutDecimals=recipe["chainTwo"]["stablecoin"]["decimals"],
        rpcUrl=recipe["chainTwo"]["chain"]["rpc"],
        routerAddress=recipe["chainTwo"]["chain"]["uniswapRouter"],
        routes=[recipe["chainTwo"]["token"]["address"], recipe["chainTwo"]["stablecoin"]["address"]]
    )

    chainOneGasPrice = getSwapQuoteOut(
        amountInNormal=1.0,
        amountInDecimals=18,
        amountOutDecimals=recipe["chainOne"]["stablecoin"]["decimals"],
        rpcUrl=recipe["chainOne"]["chain"]["rpc"],
        routerAddress=recipe["chainOne"]["chain"]["uniswapRouter"],
        routes=[recipe["chainOne"]["gas"]["address"], recipe["chainOne"]["stablecoin"]["address"]]
    )

    chainTwoGasPrice = getSwapQuoteOut(
        amountInNormal=1.0,
        amountInDecimals=18,
        amountOutDecimals=recipe["chainTwo"]["stablecoin"]["decimals"],
        rpcUrl=recipe["chainTwo"]["chain"]["rpc"],
        routerAddress=recipe["chainTwo"]["chain"]["uniswapRouter"],
        routes=[recipe["chainTwo"]["gas"]["address"], recipe["chainTwo"]["stablecoin"]["address"]]
    )

    priceDifference = calculateDifference(chainOneTokenPrice, chainTwoTokenPrice)

    origin, destination = calculateArbitrageStrategy(chainOneTokenPrice, recipe["chainOne"]["chain"]["name"], chainTwoTokenPrice, recipe["chainTwo"]["chain"]["name"])
    logger.debug(f"Calculating data origin and destination")

    recipe["arbitrage"]["directionLockEnabled"] = strToBool(os.getenv("DIRECTION_LOCK_ENABLED"))

    if recipe["arbitrage"]["directionLockEnabled"] and "directionLock" in recipe["arbitrage"]:
        directionlock = recipe["arbitrage"]["directionLock"].split(",")

        originLock = directionlock[0]
        destinationLock = directionlock[1]

        if recipe["chainOne"]["chain"]["name"] == originLock and recipe["chainTwo"]["chain"]["name"] == destinationLock:

            recipe["origin"] = recipe["chainOne"]
            recipe["origin"]["token"]["price"] = chainOneTokenPrice
            recipe["origin"]["gas"]["price"] = chainOneGasPrice

            recipe["destination"] = recipe["chainTwo"]
            recipe["destination"]["token"]["price"] = chainTwoTokenPrice
            recipe["destination"]["gas"]["price"] = chainTwoGasPrice

        elif recipe["chainTwo"]["chain"]["name"] == originLock and recipe["chainOne"]["chain"]["name"] == destinationLock:

            recipe["origin"] = recipe["chainTwo"]
            recipe["origin"]["token"]["price"] = chainTwoTokenPrice
            recipe["origin"]["gas"]["price"] = chainTwoGasPrice

            recipe["destination"] = recipe["chainOne"]
            recipe["destination"]["token"]["price"] = chainOneTokenPrice
            recipe["destination"]["gas"]["price"] = chainOneGasPrice

        else:
            errMsg = f'Invalid direction lock: {directionlock}'
            logger.error(errMsg)
            sys.exit(errMsg)

    else:
        if origin == recipe["chainOne"]["chain"]["name"]:

            recipe["origin"] = recipe["chainOne"]
            recipe["origin"]["token"]["price"] = chainOneTokenPrice
            recipe["origin"]["gas"]["price"] = chainOneGasPrice

            recipe["destination"] = recipe["chainTwo"]
            recipe["destination"]["token"]["price"] = chainTwoTokenPrice
            recipe["destination"]["gas"]["price"] = chainTwoGasPrice
        else:
            recipe["origin"] = recipe["chainTwo"]
            recipe["origin"]["token"]["price"] = chainTwoTokenPrice
            recipe["origin"]["gas"]["price"] = chainTwoGasPrice

            recipe["destination"] = recipe["chainOne"]
            recipe["destination"]["token"]["price"] = chainOneTokenPrice
            recipe["destination"]["gas"]["price"] = chainOneGasPrice

    recipe["info"]["reportString"] = \
        f'Buy: {recipe["origin"]["token"]["name"]} on ' \
        f'{recipe["origin"]["chain"]["name"]} @ ' \
        f'{recipe["origin"]["token"]["price"]} {recipe["origin"]["stablecoin"]["symbol"]} ' \
        f'Sell: {recipe["destination"]["token"]["name"]} on ' \
        f'{recipe["destination"]["chain"]["name"]} ' \
        f'@ {recipe["destination"]["token"]["price"]} ' \
        f'{recipe["origin"]["stablecoin"]["symbol"]} for a {priceDifference}% data'

    printSeperator()

    if recipe["arbitrage"]["directionLockEnabled"]:
        logger.info(f'[ARB #{recipe["info"]["currentRoundTripCount"]}] Locked Arbitrage Opportunity Identified')
    else:
        logger.info(f'[ARB #{recipe["info"]["currentRoundTripCount"]}] Arbitrage Opportunity Identified')

    logger.info(
        f'Buy: {recipe["origin"]["token"]["name"]} @ ${round(recipe["origin"]["token"]["price"], 6)} on '
        f'{recipe["origin"]["chain"]["name"]}'
    )

    logger.info(
        f'Sell: {recipe["destination"]["token"]["name"]} @ ${round(recipe["destination"]["token"]["price"], 6)} on '
        f'{recipe["destination"]["chain"]["name"]} '
    )

    printSeperator()

    logger.info(
        f'Arbitrage: {priceDifference}% difference'
    )

    del recipe["chainOne"], recipe["chainTwo"]

    printSeperator(True)

    return recipe

def simulateArbitrage(recipe):

    arbStrat = getJSONFile(folder="arbitrage", file="arbStrat.json", section=None)
    steps = OrderedDict(arbStrat)

    if not recipe["status"]["stablesAreOnOrigin"]:
        steps = prependToOrderedDict(
            steps,
            (
                "stepZero",
                {
                    "from": "stablecoin",
                    "to": "stablecoin",
                    "position": "destination",
                    "type": "bridge"
                }
            )
        )

    printSeperator()
    logger.info(f"[ARB #{recipe['info']['currentRoundTripCount']}] "
                f"Simulating Arbitrage")
    printSeperator()

    startingStables = recipe["status"]["capital"]

    currentFunds = {
        "stablecoin": startingStables,
        "token": 0
    }


    for stepNumber, stepSettings in steps.items():

        stepType = stepSettings["type"]
        position = stepSettings["position"]
        oppositePosition = getOppositeDirection(position)
        toSwapFrom = stepSettings["from"]
        toSwapTo = stepSettings["to"]

        stepNumber = list(steps).index(stepNumber) + 1

        if stepNumber <= 1:
            logger.info(f'Starting Capital: {startingStables} {recipe[position]["stablecoin"]["name"]}')
            printSeperator()

        if toSwapTo != "done":

            logger.info(f'{stepNumber}. {stepType.title()} {round(currentFunds[toSwapFrom], 6)} {recipe[position][toSwapFrom]["name"]} -> {recipe[position][toSwapTo]["name"]}')

            printSeperator()

            if stepType == "swap":

                hasCustomRoutes = "routes" in recipe[position] and toSwapFrom in recipe[position]["routes"]

                routes = []
                if hasCustomRoutes:
                    for route in recipe[position]["routes"][toSwapFrom]:
                        routes.append(route["address"])
                    amountOutDecimals = recipe[position]["routes"][toSwapFrom][-1]["decimals"]
                else:
                    routes = [recipe[position][toSwapFrom]["address"], recipe[position][toSwapTo]["address"]]
                    amountOutDecimals = recipe[position][toSwapTo]["decimals"]

                quote = getSwapQuoteOut(
                    amountInNormal=currentFunds[toSwapFrom],
                    amountInDecimals=recipe[position][toSwapFrom]["decimals"],
                    amountOutDecimals=amountOutDecimals,
                    rpcUrl=recipe[position]["chain"]["rpc"],
                    routerAddress=recipe[position]["chain"]["uniswapRouter"],
                    routes=routes
                )

            elif stepType == "bridge":

                quote = estimateBridgeOutput(
                    fromChain=recipe[position]["chain"]["id"],
                    toChain=recipe[oppositePosition]["chain"]["id"],
                    fromToken=recipe[position][toSwapFrom]['symbol'],
                    toToken=recipe[oppositePosition][toSwapFrom]['symbol'],
                    amountToBridge=currentFunds[toSwapFrom],
                    decimalPlacesFrom=recipe[position][toSwapFrom]["decimals"],
                    decimalPlacesTo=recipe[oppositePosition][toSwapFrom]["decimals"],
                    returning=(not position == "origin"))

            else:
                errMsg = f'Invalid Arbitrage simulation type: {stepType}'
                logger.error(errMsg)
                sys.exit(errMsg)

            currentFunds[toSwapTo] = quote

            logger.info(f'   Out {round(currentFunds[toSwapTo], 6)} {recipe[position][toSwapTo]["name"]}')

            printSeperator()

        else:

            isProfitable = currentFunds["stablecoin"] > startingStables
            profitLoss = abs(currentFunds["stablecoin"] - startingStables)

            if isProfitable:
                diff = percentageDifference(currentFunds["stablecoin"], startingStables, 2)
                logger.info(f'Profit: ${round(profitLoss, 6)} ({diff}%)')
            else:
                diff = percentageDifference(startingStables, currentFunds["stablecoin"], 2)
                logger.info(f'Loss: ${round(profitLoss, 6)} ({diff}%)')

            return isProfitable

def executeArbitrage(recipe, startingTime, telegramStatusMessage):

    arbStrat = getJSONFile(folder="arbitrage", file="arbStrat.json", section=None)
    steps = OrderedDict(arbStrat)

    if not recipe["status"]["stablesAreOnOrigin"]:
        steps = prependToOrderedDict(
            steps,
            (
                "stepZero",
                {
                    "from": "stablecoin",
                    "to": "stablecoin",
                    "position": "destination",
                    "type": "bridge"
                }
            )
        )

    printSeperator()
    logger.info(f"[ARB #{recipe['info']['currentRoundTripCount']}] "
                f"Executing Arbitrage")
    printSeperator()

    startingStables = recipe["status"]["capital"]

    currentFunds = {
        "stablecoin": startingStables,
        "token": 0
    }

    for stepNumber, stepSettings in steps.items():

        stepType = stepSettings["type"]
        position = stepSettings["position"]
        oppositePosition = getOppositeDirection(position)
        toSwapFrom = stepSettings["from"]
        toSwapTo = stepSettings["to"]

        recipe = topUpWalletGas(
            recipe=recipe,
            direction=position,
            toSwapFrom=toSwapFrom
        )

        stepNumber = list(steps).index(stepNumber) + 1

        if stepNumber <= 1:
            logger.info(f'Starting Capital: {startingStables} {recipe[position]["stablecoin"]["name"]}')
            printSeperator()

        if toSwapTo != "done":

            logger.info(f'{stepNumber}. {stepType.title()} {round(currentFunds[toSwapFrom], 6)} {recipe[position][toSwapFrom]["name"]} -> {recipe[position][toSwapTo]["name"]}')

            telegramStatusMessage = appendToMessage(originalMessage=telegramStatusMessage, messageToAppend=f"{stepNumber}. Doing {position.title()} {stepType.title()} -> 📤")

            printSeperator()

            if stepType == "swap":

                hasCustomRoutes = "routes" in recipe[position] and toSwapFrom in recipe[position]["routes"]

                routes = []
                if hasCustomRoutes:
                    for route in recipe[position]["routes"][toSwapFrom]:
                        routes.append(route["address"])
                    amountOutDecimals = recipe[position]["routes"][toSwapFrom][-1]["decimals"]
                else:
                    routes = [recipe[position][toSwapFrom]["address"], recipe[position][toSwapTo]["address"]]
                    amountOutDecimals = recipe[position][toSwapTo]["decimals"]

                amountOutQuoted = getSwapQuoteOut(
                    amountInNormal=currentFunds[toSwapFrom],
                    amountInDecimals=recipe[position][toSwapFrom]["decimals"],
                    amountOutDecimals=amountOutDecimals,
                    rpcUrl=recipe[position]["chain"]["rpc"],
                    routerAddress=recipe[position]["chain"]["uniswapRouter"],
                    routes=routes
                )

                amountOutMinWithSlippage = getValueWithSlippage(amount=amountOutQuoted, slippage=0.5)

                swapResult = swapToken(
                    amountInNormal=currentFunds[toSwapFrom],
                    amountInDecimals=recipe[position][toSwapFrom]["decimals"],
                    amountOutNormal=amountOutMinWithSlippage,
                    amountOutDecimals=recipe[position][toSwapTo]["decimals"],
                    tokenPath=routes,
                    rpcURL=recipe[position]["chain"]["rpc"],
                    arbitrageNumber=recipe["info"]["currentRoundTripCount"],
                    stepCategory=f"{stepNumber}_swap",
                    explorerUrl=recipe[position]["chain"]["blockExplorer"],
                    routerAddress=recipe[position]["chain"]["uniswapRouter"],
                    telegramStatusMessage=telegramStatusMessage,
                    txDeadline=300,
                    txTimeoutSeconds=150,
                    swappingToGas=strToBool(recipe[position][toSwapTo]["isGas"])
                )

                output = swapResult["swapOutput"]

                telegramStatusMessage = swapResult["telegramStatusMessage"]

            elif stepType == "bridge":

                bridgeResult = executeBridge(
                    fromChain=recipe[position]["chain"]["id"],
                    fromTokenSymbol=recipe[position][toSwapFrom]['symbol'],
                    fromTokenDecimals=recipe[position][toSwapFrom]["decimals"],
                    fromChainRPCURL=recipe[position]["chain"]["rpc"],
                    toChain=recipe[oppositePosition]["chain"]["id"],
                    toTokenSymbol=recipe[oppositePosition][toSwapFrom]['symbol'],
                    toTokenDecimals=recipe[oppositePosition][toSwapFrom]['decimals'],
                    toTokenAddress=recipe[oppositePosition][toSwapFrom]['address'],
                    toChainRPCURL=recipe[oppositePosition]["chain"]["rpc"],
                    arbitrageNumber=recipe["info"]["currentRoundTripCount"],
                    stepCategory=f"{stepNumber}_bridge",
                    amountToBridge=currentFunds[toSwapFrom],
                    explorerUrl=recipe[position]["chain"]["blockExplorer"],
                    telegramStatusMessage=telegramStatusMessage
                )

                output = bridgeResult["bridgeOutput"]

                telegramStatusMessage = bridgeResult["telegramStatusMessage"]

            else:
                updatedStatusMessage(originalMessage=telegramStatusMessage, newStatus="⛔️")
                errMsg = f'Invalid Arbitrage execution type: {stepType}'
                logger.error(errMsg)
                sys.exit(errMsg)

            currentFunds[toSwapTo] = output

            printSeperator()

            logger.info(f'Output: {round(currentFunds[toSwapTo], 6)} {recipe[position][toSwapTo]["name"]}')
            telegramStatusMessage = updatedStatusMessage(originalMessage=telegramStatusMessage, newStatus="✅")

            printSeperator()

        else:

            wasProfitable = currentFunds["stablecoin"] > startingStables
            profitLoss = abs(currentFunds["stablecoin"] - startingStables)

            printSeperator(True)

            if wasProfitable:
                diff = percentageDifference(currentFunds["stablecoin"], startingStables, 2)
            else:
                diff = percentageDifference(startingStables, currentFunds["stablecoin"], 2)

            printArbitrageResult(count=recipe["info"]["currentRoundTripCount"], amount=profitLoss, percentageDifference=diff, wasProfitable=wasProfitable, startingTime=startingTime, telegramStatusMessage=telegramStatusMessage)

            return wasProfitable

# Predict our potential profit/loss
def calculatePotentialProfit(recipe, trips="1,2,5,10,20,100,250,500,1000"):
    logger.debug(f"Calculating potential profit")

    tripPredictions = {}

    trips = list(map(int, trips.split(",")))

    tripIsProfitible = False

    for tripAmount in trips:

        startingCapital = recipe["status"]["capital"]
        currentCapital = startingCapital
        profitLoss = 0

        tripIsProfitible = False

        for _ in repeat(None, tripAmount):

            capitalAfterFees = currentCapital - recipe["status"]["fees"]["total"]

            tokensBought = capitalAfterFees / recipe["origin"]["token"]["price"]

            arbSell = tokensBought * recipe["destination"]["token"]["price"]

            profitLoss = arbSell - startingCapital

            currentCapital = startingCapital + profitLoss

            tripIsProfitible = currentCapital > startingCapital

        if tripIsProfitible:
            logger.info(f"{tripAmount} Round trips would result in a PROFIT [ Total: {currentCapital} | P/L ${profitLoss} ]")
        else:
            logger.info(f"{tripAmount} Round trips would result in a LOSS [ Total: {currentCapital} | P/L ${profitLoss} ]")

        tripPredictions[f"{tripAmount}"] = {"Total": currentCapital, "P/L": profitLoss, "Profitable": tripIsProfitible}

    return tripIsProfitible

# Calculate the difference between two tokens
def calculateDifference(pairOne, pairTwo):
    logger.debug(f"Calculating pair difference")
    return abs(round(((pairTwo - pairOne) * 100) / pairOne, 2))

# Determine which token is the origin and destination
def calculateArbitrageStrategy(n1Price, n1Name, n2Price, n2Name):
    if n1Price < n2Price:
        return n1Name, n2Name
    elif n2Price < n1Price:
        return n2Name, n1Name
    else:
        return None, None

# Check if arbitrage is worth it
def checkArbitrageIsWorthIt(difference):
    # Dex Screen Envs
    threshold = float(os.environ.get("ARBITRAGE_THRESHOLD"))
    if difference >= threshold:
        return True
    else:
        return False