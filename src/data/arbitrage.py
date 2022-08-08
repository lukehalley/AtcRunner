import logging
import os
from decimal import Decimal
from itertools import repeat

from src.api.firebase import fetchFromDatabase
from src.api.synapsebridge import estimateBridgeOutput
from src.api.telegrambot import appendToMessage, updatedStatusMessage
from src.api.firebase import fetchArbitrageStrategy
from src.utils.chain import getOppositeDirection, getValueWithSlippage
from src.utils.general import strToBool, printSeperator, percentageDifference, printArbitrageRollbackComplete, \
    printArbitrageResult, truncateDecimal
from src.wallet.actions.bridge import executeBridge
from src.wallet.actions.network import topUpWalletGas
from src.wallet.actions.swap import swapToken, setupWallet
from src.wallet.queries.network import getWalletsInformation
from src.wallet.queries.swap import getSwapQuoteOut
from src.web.actions import getRoutesFromFrontend

# Set up our logging
logger = logging.getLogger("DFK-DEX")


def getNextArbitrageNumber():
    arbitrages = fetchFromDatabase("arbitrages")
    if arbitrages:
        return sorted([int(w.replace('arbitrage_', '')) for w in list(arbitrages.keys())])[-1] + 1
    else:
        return 1

# Determine our arbitrage strategy
def determineArbitrageStrategy(recipe):
    logger.debug(f"Calling Dexscreener API to find current price of pair")

    recipe["arbitrage"]["currentRoundTripCount"] = getNextArbitrageNumber()

    chainOneTokenPrice = getSwapQuoteOut(
        amountInNormal=1.0,
        amountInDecimals=recipe["chainOne"]["token"]["decimals"],
        amountOutDecimals=recipe["chainOne"]["stablecoin"]["decimals"],
        rpcUrl=recipe["chainOne"]["chain"]["rpc"],
        routerAddress=recipe["chainOne"]["chain"]["contracts"]["router"]["address"],
        routerABI=recipe["chainOne"]["chain"]["contracts"]["router"]["abi"],
        routes=recipe["chainOne"]["routes"]["token-stablecoin"]
    )

    chainTwoTokenPrice = getSwapQuoteOut(
        amountInNormal=1.0,
        amountInDecimals=recipe["chainTwo"]["token"]["decimals"],
        amountOutDecimals=recipe["chainTwo"]["stablecoin"]["decimals"],
        rpcUrl=recipe["chainTwo"]["chain"]["rpc"],
        routerAddress=recipe["chainTwo"]["chain"]["contracts"]["router"]["address"],
        routerABI=recipe["chainTwo"]["chain"]["contracts"]["router"]["abi"],
        routes=recipe["chainTwo"]["routes"]["token-stablecoin"]
    )

    chainOneGasPrice = getSwapQuoteOut(
        amountInNormal=1.0,
        amountInDecimals=18,
        amountOutDecimals=recipe["chainOne"]["stablecoin"]["decimals"],
        rpcUrl=recipe["chainOne"]["chain"]["rpc"],
        routerAddress=recipe["chainOne"]["chain"]["contracts"]["router"]["address"],
        routerABI=recipe["chainOne"]["chain"]["contracts"]["router"]["abi"],
        routes=[recipe["chainOne"]["gas"]["address"], recipe["chainOne"]["stablecoin"]["address"]]
    )

    chainTwoGasPrice = getSwapQuoteOut(
        amountInNormal=1.0,
        amountInDecimals=18,
        amountOutDecimals=recipe["chainTwo"]["stablecoin"]["decimals"],
        rpcUrl=recipe["chainTwo"]["chain"]["rpc"],
        routerAddress=recipe["chainTwo"]["chain"]["contracts"]["router"]["address"],
        routerABI=recipe["chainTwo"]["chain"]["contracts"]["router"]["abi"],
        routes=[recipe["chainTwo"]["gas"]["address"], recipe["chainTwo"]["stablecoin"]["address"]]
    )

    priceDifference = calculateDifference(chainOneTokenPrice, chainTwoTokenPrice)

    origin, destination = calculateArbitrageStrategy(chainOneTokenPrice, recipe["chainOne"]["chain"]["name"],
                                                     chainTwoTokenPrice, recipe["chainTwo"]["chain"]["name"])
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

        elif recipe["chainTwo"]["chain"]["name"] == originLock and recipe["chainOne"]["chain"][
            "name"] == destinationLock:

            recipe["origin"] = recipe["chainTwo"]
            recipe["origin"]["token"]["price"] = chainTwoTokenPrice
            recipe["origin"]["gas"]["price"] = chainTwoGasPrice

            recipe["destination"] = recipe["chainOne"]
            recipe["destination"]["token"]["price"] = chainOneTokenPrice
            recipe["destination"]["gas"]["price"] = chainOneGasPrice

        else:
            errMsg = f'Invalid direction lock: {directionlock}'
            logger.error(errMsg)
            raise Exception(errMsg)

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

    printSeperator()

    if recipe["arbitrage"]["directionLockEnabled"]:
        logger.info(f'[ARB #{recipe["arbitrage"]["currentRoundTripCount"]}] Locked Arbitrage Opportunity Identified')
    else:
        logger.info(f'[ARB #{recipe["arbitrage"]["currentRoundTripCount"]}] Arbitrage Opportunity Identified')

    logger.info(
        f'Buy: {recipe["origin"]["token"]["name"]} @ ${truncateDecimal(recipe["origin"]["token"]["price"], 6)} on '
        f'{recipe["origin"]["chain"]["name"]}'
    )

    logger.info(
        f'Sell: {recipe["destination"]["token"]["name"]} @ ${truncateDecimal(recipe["destination"]["token"]["price"], 6)} on '
        f'{recipe["destination"]["chain"]["name"]} '
    )

    printSeperator()

    logger.info(
        f'Arbitrage: {priceDifference}% difference'
    )

    del recipe["chainOne"], recipe["chainTwo"]

    printSeperator(True)

    return recipe

def getRoutes(recipe, position, driver, currentFunds, toSwapFrom, toSwapTo):
    if driver:
        routes = getRoutesFromFrontend(
            driver=driver,
            network=recipe[position]["chain"]["name"],
            dexURL=recipe[position]["chain"]["frontendUrl"],
            amountToSwap=currentFunds[toSwapFrom],
            tokenSymbolIn=recipe[position][toSwapFrom]["symbol"],
            tokenSymbolOut=recipe[position][toSwapTo]["symbol"]
        )
    else:
        routes = recipe[position]["routes"][f"{toSwapFrom}-{toSwapTo}"]

    return routes

def simulateStep(recipe, stepSettings, currentFunds, driver=None):
    stepType = stepSettings["type"]
    position = stepSettings["position"]
    oppositePosition = getOppositeDirection(position)

    toSwapFrom = stepSettings["from"]
    toSwapTo = stepSettings["to"]

    if stepType == "swap":
        routeAddressList = getRoutes(recipe=recipe, position=position, driver=driver, currentFunds=currentFunds,
                                     toSwapFrom=toSwapFrom, toSwapTo=toSwapTo)

        quote = getSwapQuoteOut(
            amountInNormal=currentFunds[toSwapFrom],
            amountInDecimals=recipe[position][toSwapFrom]["decimals"],
            amountOutDecimals=recipe[position][toSwapTo]["decimals"],
            rpcUrl=recipe[position]["chain"]["rpc"],
            routerAddress=recipe[position]["chain"]["contracts"]["router"]["address"],
            routerABI=recipe[position]["chain"]["contracts"]["router"]["abi"],
            routes=routeAddressList
        )

    elif stepType == "bridge":
        quote = estimateBridgeOutput(
            fromChain=recipe[position]["chain"]["id"],
            toChain=recipe[oppositePosition]["chain"]["id"],
            fromToken=recipe[position][toSwapFrom]["address"],
            toToken=recipe[oppositePosition][toSwapFrom]['address'],
            amountToBridge=currentFunds[toSwapFrom],
            decimalPlacesFrom=recipe[position][toSwapFrom]["decimals"],
            decimalPlacesTo=recipe[oppositePosition][toSwapFrom]["decimals"],
            returning=(not position == "origin"))
    else:
        errMsg = f'Invalid Arbitrage simulation type: {stepType}'
        logger.error(errMsg)
        raise Exception(errMsg)

    return quote

def checkArbitrageIsProfitable(recipe, originDriver, destinationDriver, printInfo=True, position="origin"):
    steps = fetchArbitrageStrategy(strategyName="networkBridge")
    isProfitable = False

    if not recipe["status"]["stablesAreOnOrigin"]:
        balanceOnDest = recipe["destination"]["wallet"]["balances"]["stablecoin"]
        recipe["destination"]["wallet"]["balances"]["stablecoin"] = recipe["origin"]["wallet"]["balances"]["stablecoin"]
        recipe["origin"]["wallet"]["balances"]["stablecoin"] = balanceOnDest

    if printInfo:
        printSeperator()
        logger.info(f"[ARB #{recipe['arbitrage']['currentRoundTripCount']}] "
                    f"Simulating Arbitrage")
        printSeperator()

    if "startingStables" in recipe["status"]:
        startingStables = recipe["status"]["startingStables"]
    else:
        startingStables = recipe[position]["wallet"]["balances"]["stablecoin"]

    startingTokens = recipe[position]["wallet"]["balances"]["token"]

    currentFunds = {
        "stablecoin": startingStables,
        "token": startingTokens
    }

    predictions = {"steps": {}}

    for stepSettings in steps:

        stepNumber = steps.index(stepSettings) + 1

        if not stepSettings["done"]:

            position = stepSettings["position"]
            stepType = stepSettings["type"]

            toSwapFrom = stepSettings["from"]
            toSwapTo = stepSettings["to"]

            if position == "origin":
                driver = originDriver
            else:
                driver = destinationDriver

            if stepNumber <= 1 and printInfo:
                logger.info(f'Starting Capital: {startingStables} {recipe[position]["stablecoin"]["name"]}')
                printSeperator()

            if toSwapTo != "done":

                if printInfo:
                    logger.info(
                        f'{stepNumber}. {stepType.title()} {truncateDecimal(currentFunds[toSwapFrom], 6)} {recipe[position][toSwapFrom]["name"]} -> {recipe[position][toSwapTo]["name"]}')

                predictions["steps"][stepNumber] = {
                    "stepType": stepType,
                    "amountIn": currentFunds[toSwapFrom],
                }

                if printInfo:
                    printSeperator()

                quote = simulateStep(recipe=recipe, stepSettings=stepSettings, currentFunds=currentFunds, driver=driver)

                currentFunds[toSwapTo] = quote

                if printInfo:
                    logger.info(
                        f'   Out {truncateDecimal(currentFunds[toSwapTo], 6)} {recipe[position][toSwapTo]["name"]}')

                predictions["steps"][stepNumber]["amountOut"] = currentFunds[toSwapTo]

                if printInfo:
                    printSeperator()

            else:

                arbitragePercentage = percentageDifference(currentFunds["stablecoin"], startingStables, 2)
                isOverPercentage = checkArbitrageIsWorthIt(difference=arbitragePercentage)

                isProfitable = (currentFunds["stablecoin"] > startingStables) and isOverPercentage

                profitLoss = currentFunds["stablecoin"] - startingStables
                profitLossReadable = truncateDecimal(profitLoss, 2)

                startingStablesReadable = truncateDecimal(startingStables, 2)
                outStablesReadable = truncateDecimal(currentFunds["stablecoin"], 2)

                calculateDifference(outStablesReadable, startingStablesReadable)

                if profitLossReadable > 0:
                    amountStr = f"${profitLossReadable}"
                else:
                    amountStr = f"-${abs(profitLossReadable)}"

                if printInfo:
                    if isProfitable:
                        logger.info(f'Profit: {amountStr} ({arbitragePercentage}%)')
                    else:
                        logger.info(f'Loss: {amountStr} ({arbitragePercentage}%)')

                predictions["startingStables"] = startingStablesReadable
                predictions["outStables"] = outStablesReadable
                predictions["profitLoss"] = profitLossReadable
                predictions["arbitragePercentage"] = arbitragePercentage

    return isProfitable, predictions

def executeArbitrage(recipe, predictions, startingTime, telegramStatusMessage):
    steps = fetchArbitrageStrategy(strategyName="networkBridge")

    printSeperator()
    logger.info(f"[ARB #{recipe['arbitrage']['currentRoundTripCount']}] "
                f"Executing Arbitrage")
    printSeperator()

    recipe = getWalletsInformation(recipe)

    startingStables = recipe["origin"]["wallet"]["balances"]["stablecoin"]

    recipe["status"]["startingStables"] = startingStables

    currentFunds = {
        "stablecoin": startingStables,
        "token": 0
    }

    for stepSettings in steps:

        stepType = stepSettings["type"]
        stepNumber = steps.index(stepSettings) + 1
        stepName = stepSettings["name"]

        position = stepSettings["position"]
        oppositePosition = getOppositeDirection(position)
        toSwapFrom = stepSettings["from"]
        toSwapTo = stepSettings["to"]

        recipe, toppedUpOccured, telegramStatusMessage = topUpWalletGas(
            recipe=recipe,
            direction=position,
            toSwapFrom=toSwapFrom,
            telegramStatusMessage=telegramStatusMessage,
        )

        if toppedUpOccured:
            currentFunds["stablecoin"] = recipe[position]["wallet"]["balances"]["stablecoin"]
            currentFunds["token"] = recipe[position]["wallet"]["balances"]["token"]

        recipe = getWalletsInformation(recipe)

        if stepNumber <= 1:
            logger.info(f'Starting Capital: {currentFunds["stablecoin"]} {recipe[position]["stablecoin"]["name"]}')
            printSeperator(True)

        if toSwapTo != "done":

            recipe = getWalletsInformation(recipe)

            printSeperator()

            logger.info(
                f'{stepNumber}. {stepType.title()} {truncateDecimal(currentFunds[toSwapFrom], 6)} {recipe[position][toSwapFrom]["name"]} -> {recipe[position][toSwapTo]["name"]}')

            telegramStatusMessage = appendToMessage(originalMessage=telegramStatusMessage,
                                                    messageToAppend=f"{stepNumber}. Doing {position.title()} {stepType.title()} -> 📤")

            if stepType == "swap":

                balanceBeforeSwap = recipe[position]["wallet"]["balances"][toSwapTo]

                swapRoute = recipe[position]["routes"][f"{toSwapFrom}-{toSwapTo}"]

                amountOutQuoted = getSwapQuoteOut(
                    amountInNormal=currentFunds[toSwapFrom],
                    amountInDecimals=recipe[position][toSwapFrom]["decimals"],
                    amountOutDecimals=recipe[position][toSwapTo]["decimals"],
                    rpcUrl=recipe[position]["chain"]["rpc"],
                    routerAddress=recipe[position]["chain"]["contracts"]["router"]["address"],
                    routerABI=recipe[position]["chain"]["contracts"]["router"]["abi"],
                    routes=swapRoute
                )

                amountOutMinWithSlippage = getValueWithSlippage(amount=amountOutQuoted, slippage=0.5)

                swapResult = swapToken(
                    amountInNormal=currentFunds[toSwapFrom],
                    amountInDecimals=recipe[position][toSwapFrom]["decimals"],
                    amountOutNormal=amountOutMinWithSlippage,
                    amountOutDecimals=recipe[position][toSwapTo]["decimals"],
                    tokenPath=swapRoute,
                    rpcURL=recipe[position]["chain"]["rpc"],
                    arbitrageNumber=recipe["arbitrage"]["currentRoundTripCount"],
                    stepCategory=f"{stepNumber}_swap",
                    explorerUrl=recipe[position]["chain"]["blockExplorer"]["txBaseURL"],
                    routerAddress=recipe[position]["chain"]["contracts"]["router"]["address"],
                    routerABI=recipe[position]["chain"]["contracts"]["router"]["abi"],
                    wethContractABI=recipe[position]["chain"]["contracts"]["weth"]["abi"],
                    telegramStatusMessage=telegramStatusMessage,
                    swappingFromGas=strToBool(recipe[position][toSwapFrom]["isGas"]),
                    swappingToGas=strToBool(recipe[position][toSwapTo]["isGas"]),

                )

                recipe = getWalletsInformation(recipe)

                balanceAfterSwap = recipe[position]["wallet"]["balances"][toSwapTo]

                while balanceAfterSwap == balanceBeforeSwap:
                    recipe = getWalletsInformation(recipe)
                    balanceAfterSwap = recipe[position]["wallet"]["balances"][toSwapTo]

                result = balanceAfterSwap - balanceBeforeSwap

                currentFunds[toSwapTo] = result

                telegramStatusMessage = swapResult["telegramStatusMessage"]

            elif stepType == "bridge":

                balanceBeforeBridge = recipe[oppositePosition]["wallet"]["balances"][toSwapFrom]

                if stepName == "destinationBridge":

                    quote = simulateStep(recipe=recipe, stepSettings=stepSettings, currentFunds=currentFunds,
                                         driver=None)

                    if quote < startingStables:
                        telegramStatusMessage = appendToMessage(originalMessage=telegramStatusMessage,
                                                                messageToAppend=f"Rolling Back Arbitrage #{recipe['arbitrage']['currentRoundTripCount']} ‍⏮")

                        wasProfitable = rollbackArbitrage(recipe=recipe, currentFunds=currentFunds,
                                                          startingStables=startingStables, startingTime=startingTime,
                                                          telegramStatusMessage=telegramStatusMessage)

                        return wasProfitable

                bridgeResult = executeBridge(
                    amountToBridge=currentFunds[toSwapFrom],
                    fromChain=recipe[position]["chain"]["id"],
                    fromTokenAddress=recipe[position][toSwapFrom]['address'],
                    fromTokenDecimals=recipe[position][toSwapFrom]["decimals"],
                    fromChainRPCURL=recipe[position]["chain"]["rpc"],
                    toChain=recipe[oppositePosition]["chain"]["id"],
                    toTokenDecimals=recipe[oppositePosition][toSwapFrom]['decimals'],
                    toTokenAddress=recipe[oppositePosition][toSwapFrom]['address'],
                    toChainRPCURL=recipe[oppositePosition]["chain"]["rpc"],
                    wethContractABI=recipe[position]["chain"]["contracts"]["weth"]["abi"],
                    arbitrageNumber=recipe["arbitrage"]["currentRoundTripCount"],
                    stepCategory=f"{stepNumber}_bridge",
                    explorerUrl=recipe[position]["chain"]["blockExplorer"]["txBaseURL"],
                    telegramStatusMessage=telegramStatusMessage,
                    predictions=predictions,
                    stepNumber=stepNumber
                )

                recipe = getWalletsInformation(recipe)
                balanceAfterBridge = recipe[oppositePosition]["wallet"]["balances"][toSwapFrom]

                while balanceAfterBridge == balanceBeforeBridge:
                    recipe = getWalletsInformation(recipe)
                    balanceAfterBridge = recipe[oppositePosition]["wallet"]["balances"][toSwapFrom]

                result = balanceAfterBridge - balanceBeforeBridge

                currentFunds[toSwapFrom] = result

                telegramStatusMessage = bridgeResult["telegramStatusMessage"]

            else:
                updatedStatusMessage(originalMessage=telegramStatusMessage, newStatus="⛔️")
                errMsg = f'Invalid Arbitrage execution type: {stepType}'
                logger.error(errMsg)
                raise Exception(errMsg)

            recipe = getWalletsInformation(recipe)

            printSeperator()

            logger.info(f'Output: {truncateDecimal(result, 6)} {recipe[position][toSwapTo]["name"]}')
            telegramStatusMessage = updatedStatusMessage(originalMessage=telegramStatusMessage, newStatus="✅")

            stepSettings["done"] = True

            printSeperator(True)

        else:

            recipe = getWalletsInformation(recipe)

            wasProfitable = recipe[position]["wallet"]["balances"]["stablecoin"] > startingStables
            profitLoss = abs(recipe[position]["wallet"]["balances"]["stablecoin"] - startingStables)

            if wasProfitable:
                arbitragePercentage = percentageDifference(recipe[position]["wallet"]["balances"]["stablecoin"],
                                                           startingStables, 2)
            else:
                arbitragePercentage = percentageDifference(startingStables,
                                                           recipe[position]["wallet"]["balances"]["stablecoin"], 2)

            printArbitrageResult(count=recipe["arbitrage"]["currentRoundTripCount"], amount=profitLoss,
                                 percentageDifference=arbitragePercentage, wasProfitable=wasProfitable,
                                 startingTime=startingTime, telegramStatusMessage=telegramStatusMessage)

            return wasProfitable

def rollbackArbitrage(recipe, currentFunds, startingStables, startingTime, telegramStatusMessage):
    steps = fetchArbitrageStrategy(strategyName="networkBridgeRollback")

    printSeperator(True)

    printSeperator()
    logger.info(f"[ARB #{recipe['arbitrage']['currentRoundTripCount']}] "
                f"Rolling Back Arbitrage")
    printSeperator(True)

    normalStepCount = 4

    for stepSettings in steps:

        printSeperator()

        stepType = stepSettings["type"]
        stepNumber = steps.index(stepSettings) + 1 + normalStepCount

        position = stepSettings["position"]
        oppositePosition = getOppositeDirection(position)
        toSwapFrom = stepSettings["from"]
        toSwapTo = stepSettings["to"]

        recipe, toppedUpOccured, telegramStatusMessage = topUpWalletGas(
            recipe=recipe,
            direction=position,
            toSwapFrom=toSwapFrom,
            telegramStatusMessage=telegramStatusMessage,
        )

        if toppedUpOccured:
            currentFunds["stablecoin"] = recipe[position]["wallet"]["balances"]["stablecoin"]
            currentFunds["token"] = recipe[position]["wallet"]["balances"]["token"]

        recipe = getWalletsInformation(recipe)

        recipe = getWalletsInformation(recipe)

        logger.info(
            f'{stepNumber}. {stepType.title()} {truncateDecimal(currentFunds[toSwapFrom], 6)} {recipe[position][toSwapFrom]["name"]} -> {recipe[position][toSwapTo]["name"]}')

        telegramStatusMessage = appendToMessage(originalMessage=telegramStatusMessage,
                                                messageToAppend=f"{stepNumber}. RBack {position.title()} {stepType.title()} -> 📤")

        if stepType == "swap":

            balanceBeforeSwap = recipe[position]["wallet"]["balances"][toSwapTo]

            swapRoute = recipe[position]["routes"][f"{toSwapFrom}-{toSwapTo}"]

            amountOutQuoted = getSwapQuoteOut(
                amountInNormal=currentFunds[toSwapFrom],
                amountInDecimals=recipe[position][toSwapFrom]["decimals"],
                amountOutDecimals=recipe[position][toSwapTo]["decimals"],
                rpcUrl=recipe[position]["chain"]["rpc"],
                routerAddress=recipe[position]["chain"]["contracts"]["router"]["address"],
                routerABI=recipe[position]["chain"]["contracts"]["router"]["abi"],
                routes=swapRoute
            )

            amountOutMinWithSlippage = getValueWithSlippage(amount=amountOutQuoted, slippage=0.5)

            swapResult = swapToken(
                amountInNormal=currentFunds[toSwapFrom],
                amountInDecimals=recipe[position][toSwapFrom]["decimals"],
                amountOutNormal=amountOutMinWithSlippage,
                amountOutDecimals=recipe[position][toSwapTo]["decimals"],
                tokenPath=swapRoute,
                rpcURL=recipe[position]["chain"]["rpc"],
                arbitrageNumber=recipe["arbitrage"]["currentRoundTripCount"],
                stepCategory=f"{stepNumber}_swap",
                explorerUrl=recipe[position]["chain"]["blockExplorer"]["txBaseURL"],
                routerAddress=recipe[position]["chain"]["contracts"]["router"]["address"],
                routerABI=recipe[position]["chain"]["contracts"]["router"]["abi"],
                wethContractABI=recipe[position]["chain"]["contracts"]["weth"]["abi"],
                telegramStatusMessage=telegramStatusMessage,
                swappingFromGas=strToBool(recipe[position][toSwapFrom]["isGas"]),
                swappingToGas=strToBool(recipe[position][toSwapTo]["isGas"])
            )

            recipe = getWalletsInformation(recipe)

            balanceAfterSwap = recipe[position]["wallet"]["balances"][toSwapTo]

            while balanceAfterSwap == balanceBeforeSwap:
                recipe = getWalletsInformation(recipe)
                balanceAfterSwap = recipe[position]["wallet"]["balances"][toSwapTo]

            result = balanceAfterSwap - balanceBeforeSwap

            currentFunds[toSwapTo] = result

            telegramStatusMessage = swapResult["telegramStatusMessage"]

        elif stepType == "bridge":

            balanceBeforeBridge = recipe[oppositePosition]["wallet"]["balances"][toSwapFrom]

            bridgeResult = executeBridge(
                amountToBridge=currentFunds[toSwapFrom],
                fromChain=recipe[position]["chain"]["id"],
                fromTokenAddress=recipe[position][toSwapFrom]['address'],
                fromTokenDecimals=recipe[position][toSwapFrom]["decimals"],
                fromChainRPCURL=recipe[position]["chain"]["rpc"],
                toChain=recipe[oppositePosition]["chain"]["id"],
                toTokenDecimals=recipe[oppositePosition][toSwapFrom]['decimals'],
                toTokenAddress=recipe[oppositePosition][toSwapFrom]['address'],
                toChainRPCURL=recipe[oppositePosition]["chain"]["rpc"],
                wethContractABI=recipe[position]["chain"]["contracts"]["weth"]["abi"],
                arbitrageNumber=recipe["arbitrage"]["currentRoundTripCount"],
                stepCategory=f"{stepNumber}_bridge",
                explorerUrl=recipe[position]["chain"]["blockExplorer"]["txBaseURL"],
                telegramStatusMessage=telegramStatusMessage,
                predictions=None,
                stepNumber=stepNumber
            )

            recipe = getWalletsInformation(recipe)
            balanceAfterBridge = recipe[oppositePosition]["wallet"]["balances"][toSwapFrom]

            while balanceAfterBridge == balanceBeforeBridge:
                recipe = getWalletsInformation(recipe)
                balanceAfterBridge = recipe[oppositePosition]["wallet"]["balances"][toSwapFrom]

            result = balanceAfterBridge - balanceBeforeBridge

            currentFunds[toSwapFrom] = result

            telegramStatusMessage = bridgeResult["telegramStatusMessage"]

        else:
            updatedStatusMessage(originalMessage=telegramStatusMessage, newStatus="⛔️")
            errMsg = f'Invalid Arbitrage execution type: {stepType}'
            logger.error(errMsg)
            raise Exception(errMsg)

        recipe = getWalletsInformation(recipe)

        printSeperator()

        logger.info(f'Output: {truncateDecimal(result, 6)} {recipe[position][toSwapTo]["name"]}')
        telegramStatusMessage = updatedStatusMessage(originalMessage=telegramStatusMessage, newStatus="✅")

        stepSettings["done"] = True

        printSeperator(True)

    setupWallet(recipe=recipe)

    printSeperator(True)

    recipe = getWalletsInformation(recipe)

    wasProfitable = recipe["origin"]["wallet"]["balances"]["stablecoin"] > startingStables
    profitLoss = abs(recipe["origin"]["wallet"]["balances"]["stablecoin"] - startingStables)

    if wasProfitable:
        arbitragePercentage = percentageDifference(recipe["origin"]["wallet"]["balances"]["stablecoin"],
                                                   startingStables, 2)
    else:
        arbitragePercentage = percentageDifference(startingStables,
                                                   recipe["origin"]["wallet"]["balances"]["stablecoin"], 2)

    printArbitrageRollbackComplete(count=recipe["arbitrage"]["currentRoundTripCount"], wasProfitable=wasProfitable,
                                   profitLoss=profitLoss, arbitragePercentage=arbitragePercentage,
                                   startingTime=startingTime, telegramStatusMessage=telegramStatusMessage)

    return wasProfitable

# Predict our potential profit/loss
def calculatePotentialProfit(recipe, trips="1,2,5,10,20,100,250,500,1000"):
    logger.debug(f"Calculating potential profit")

    tripPredictions = {}

    trips = list(map(int, trips.split(",")))

    tripIsProfitible = False

    for tripAmount in trips:

        startingCapital = recipe["origin"]["wallet"]["balances"]["stablecoin"]
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
            logger.info(
                f"{tripAmount} Round trips would result in a PROFIT [ Total: {currentCapital} | P/L ${profitLoss} ]")
        else:
            logger.info(
                f"{tripAmount} Round trips would result in a LOSS [ Total: {currentCapital} | P/L ${profitLoss} ]")

        tripPredictions[f"{tripAmount}"] = {"Total": currentCapital, "P/L": profitLoss, "Profitable": tripIsProfitible}

    return tripIsProfitible

# Calculate the difference between two tokens
def calculateDifference(pairOne, pairTwo):
    logger.debug(f"Calculating pair difference")

    ans = ((pairOne - pairTwo) / ((pairOne + pairTwo) / 2)) * 100

    return round(ans, 6)

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
    threshold = Decimal(os.environ.get("ARBITRAGE_THRESHOLD"))
    if difference >= threshold:
        return True
    else:
        return False
