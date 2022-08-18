import os
from decimal import Decimal
from itertools import repeat

from src.apis.firebaseDB.firebaseDB_Querys import fetchArbitrageStrategy
from src.arbitrage.arbitrage_Simulate import simulateStep
from src.arbitrage.arbitrage_Utils import getNextArbitrageNumber
from src.chain.swap.swap_Querys import getSwapQuoteOut
from src.utils.data.data_Booleans import strToBool
from src.utils.logging.logging_Print import printSeperator
from src.utils.logging.logging_Setup import getProjectLogger
from src.utils.math.math_Decimal import truncateDecimal
from src.utils.math.math_Percentage import percentageDifference

logger = getProjectLogger()

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
        routerABIMappings=recipe["chainOne"]["chain"]["contracts"]["router"]["mapping"],
        routes=recipe["chainOne"]["routes"]["token-stablecoin"]
    )

    chainTwoTokenPrice = getSwapQuoteOut(
        amountInNormal=1.0,
        amountInDecimals=recipe["chainTwo"]["token"]["decimals"],
        amountOutDecimals=recipe["chainTwo"]["stablecoin"]["decimals"],
        rpcUrl=recipe["chainTwo"]["chain"]["rpc"],
        routerAddress=recipe["chainTwo"]["chain"]["contracts"]["router"]["address"],
        routerABI=recipe["chainTwo"]["chain"]["contracts"]["router"]["abi"],
        routerABIMappings=recipe["chainTwo"]["chain"]["contracts"]["router"]["mapping"],
        routes=recipe["chainTwo"]["routes"]["token-stablecoin"]
    )

    chainOneGasPrice = getSwapQuoteOut(
        amountInNormal=1.0,
        amountInDecimals=18,
        amountOutDecimals=recipe["chainOne"]["stablecoin"]["decimals"],
        rpcUrl=recipe["chainOne"]["chain"]["rpc"],
        routerAddress=recipe["chainOne"]["chain"]["contracts"]["router"]["address"],
        routerABI=recipe["chainOne"]["chain"]["contracts"]["router"]["abi"],
        routerABIMappings=recipe["chainOne"]["chain"]["contracts"]["router"]["mapping"],
        routes=[recipe["chainOne"]["gas"]["address"], recipe["chainOne"]["stablecoin"]["address"]]
    )

    chainTwoGasPrice = getSwapQuoteOut(
        amountInNormal=1.0,
        amountInDecimals=18,
        amountOutDecimals=recipe["chainTwo"]["stablecoin"]["decimals"],
        rpcUrl=recipe["chainTwo"]["chain"]["rpc"],
        routerAddress=recipe["chainTwo"]["chain"]["contracts"]["router"]["address"],
        routerABI=recipe["chainTwo"]["chain"]["contracts"]["router"]["abi"],
        routerABIMappings=recipe["chainTwo"]["chain"]["contracts"]["router"]["mapping"],
        routes=[recipe["chainTwo"]["gas"]["address"], recipe["chainTwo"]["stablecoin"]["address"]]
    )

    priceDifference = calculateDifference(chainOneTokenPrice, chainTwoTokenPrice)

    origin, destination = calculateArbitrageStrategy(chainOneTokenPrice, recipe["chainOne"]["chain"]["name"],
                                                     chainTwoTokenPrice, recipe["chainTwo"]["chain"]["name"])
    logger.debug(f"Calculating data origin and destination")

    directionLockEnabled = strToBool(recipe["arbitrage"]["directionLock"]["lockEnabled"])

    if directionLockEnabled:
        directionlock = recipe["arbitrage"]["directionLock"]["direction"].split(",")

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

    if directionLockEnabled:
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

# Check if Arbitrage will be profitable
def calculateArbitrageIsProfitable(recipe, printInfo=True, position="origin"):
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

                quote = simulateStep(recipe=recipe, stepSettings=stepSettings, currentFunds=currentFunds)

                currentFunds[toSwapTo] = quote

                if printInfo:
                    logger.info(
                        f'   Out {truncateDecimal(currentFunds[toSwapTo], 6)} {recipe[position][toSwapTo]["name"]}')

                predictions["steps"][stepNumber]["amountOut"] = currentFunds[toSwapTo]

                if printInfo:
                    printSeperator()

            else:

                arbitragePercentage = percentageDifference(currentFunds["stablecoin"], startingStables, 2)
                isOverPercentage = calculateArbitrageIsWorthIt(difference=arbitragePercentage)

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


# Predict our potential profit/loss
def calculatePotentialProfit(recipe, trips="1,2,5,10,20,100,250,500,1000"):
    logger.debug(f"Calculating potential profit")

    tripPredictions = {}

    trips = list(map(int, trips.split(",")))

    tripIsProfitible = False

    for tripAmount in trips:

        startingCapital = recipe["origin"]["chain"]["balances"]["stablecoin"]
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

# Calculate the difference between two token
def calculateDifference(pairOne, pairTwo):
    logger.debug(f"Calculating pair difference")

    ans = abs(((pairOne - pairTwo) / ((pairOne + pairTwo) / 2)) * 100)

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
def calculateArbitrageIsWorthIt(difference):
    # Dex Screen Envs
    threshold = Decimal(os.environ.get("ARBITRAGE_THRESHOLD"))
    if difference >= threshold:
        return True
    else:
        return False








