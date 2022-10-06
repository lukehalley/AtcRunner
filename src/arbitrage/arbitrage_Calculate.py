import asyncio
import os
from decimal import Decimal
from itertools import repeat

from src.arbitrage.arbitrage_Simulate import simulateStep
from src.arbitrage.arbitrage_Strategy import calculateCrossChainStrategy, calculateInternalChainStrategy
from src.arbitrage.arbitrage_Utils import getNextArbitrageNumber, checkIfArbitrageIsCrosschain
from src.recipe.recipe_Strategies import fetchStrategy
from src.utils.logging.logging_Print import printSeparator
from src.utils.logging.logging_Setup import getProjectLogger
from src.utils.math.math_Decimal import truncateDecimal
from src.utils.math.math_Percentage import percentageDifference

logger = getProjectLogger()


# Determine our arbitrage strategy
async def determineArbitrageStrategy(recipe):

    if not "status" in recipe:
        recipe["status"] = {}

    recipe["status"]["currentRoundTrip"] = getNextArbitrageNumber()

    isCrossChain = checkIfArbitrageIsCrosschain(
        recipe=recipe
    )

    if isCrossChain:
        recipe = calculateCrossChainStrategy(
            recipe=recipe
        )
    else:

        await calculateInternalChainStrategy(
            recipe=recipe
        )

    printSeparator(newLine=True)

    return recipe


# Check if Arbitrage will be profitable
def calculateArbitrageIsProfitable(recipe, printInfo=True, position="origin"):

    # Fetch The Recipe Strategy
    steps = fetchStrategy(recipe=recipe, strategyStepToFetch="arbitrage")
    isProfitable = False

    if not recipe["status"]["stablesAreOnOrigin"]:
        balanceOnDest = recipe["destination"]["wallet"]["balances"]["stablecoin"]
        recipe["destination"]["wallet"]["balances"]["stablecoin"] = recipe["origin"]["wallet"]["balances"]["stablecoin"]
        recipe["origin"]["wallet"]["balances"]["stablecoin"] = balanceOnDest

    if printInfo:
        printSeparator()
        logger.info(f"[ARB #{recipe['status']['currentRoundTrip']}] "
                    f"Simulating Arbitrage")
        printSeparator()

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

        position = stepSettings["position"]
        stepType = stepSettings["type"]

        toSwapFrom = stepSettings["from"]
        toSwapTo = stepSettings["to"]

        if stepNumber <= 1 and printInfo:
            logger.info(f'Starting Capital: {startingStables} {recipe[position]["stablecoin"]["name"]}')
            printSeparator()

        if toSwapTo != "done":

            if printInfo:
                logger.info(
                    f'{stepNumber}. {stepType.title()} {truncateDecimal(currentFunds[toSwapFrom], 6)} {recipe[position][toSwapFrom]["name"]} -> {recipe[position][toSwapTo]["name"]}')

            predictions["steps"][stepNumber] = {
                "stepType": stepType,
                "amountIn": currentFunds[toSwapFrom],
            }

            if printInfo:
                printSeparator()

            quote = simulateStep(
                recipe=recipe,
                stepSettings=stepSettings,
                currentFunds=currentFunds
            )

            currentFunds[toSwapTo] = quote

            if printInfo:
                logger.info(
                    f'   Out {truncateDecimal(currentFunds[toSwapTo], 6)} {recipe[position][toSwapTo]["name"]}')

            predictions["steps"][stepNumber]["amountOut"] = currentFunds[toSwapTo]

            if printInfo:
                printSeparator()

        else:

            arbitragePercentage = percentageDifference(currentFunds["stablecoin"], startingStables, 2)
            isOverPercentage = calculateArbitrageIsWorthIt(difference=arbitragePercentage)

            isProfitable = (currentFunds["stablecoin"] > startingStables) and isOverPercentage

            profitLoss = currentFunds["stablecoin"] - startingStables
            profitLossReadable = truncateDecimal(profitLoss, 2)

            startingStablesReadable = truncateDecimal(startingStables, 2)
            outStablesReadable = truncateDecimal(currentFunds["stablecoin"], 2)

            calculatePairDifference(outStablesReadable, startingStablesReadable)

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

    recipe["arbitrage"]["isProfitable"] = isProfitable
    recipe["arbitrage"]["predictions"] = predictions

    return recipe


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
def calculatePairDifference(pairOne, pairTwo):
    logger.debug(f"Calculating pair difference")

    ans = abs(((pairOne - pairTwo) / ((pairOne + pairTwo) / 2)) * 100)

    return round(ans, 6)


# Determine which token is the origin and destination
def calculateCrosschainOriginDestinationTokens(n1Price, n1Name, n2Price, n2Name):
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
