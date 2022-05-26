import logging
import os
import requests
from itertools import repeat
import helpers.Dex as Dex

logger = logging.getLogger("DFK-DEX")

def setUpArbitrage(recipe):

    logger.debug(f"Calling Dexscreener API to find current price of pair")

    chainOnePrice = Dex.getTokenPrice(recipe["chainOne"]["chain"]["name"], recipe["chainOne"]["token"]["tokenAddress"])
    chainTwoPrice = Dex.getTokenPrice(recipe["chainTwo"]["chain"]["name"], recipe["chainTwo"]["token"]["tokenAddress"])

    # Calculate
    priceDifference = calculateDifference(chainOnePrice, chainTwoPrice)

    origin, destination = calculateArbitrageStrategy(chainOnePrice, recipe["chainOne"]["chain"]["name"], chainTwoPrice, recipe["chainOne"]["chain"]["name"])
    logger.debug(f"Calculating arbitrage origin and destination")

    if origin == recipe["chainOne"]["chain"]["name"]:

        recipe["origin"] = recipe["chainOne"]
        recipe["origin"]["token"]["price"] = chainOnePrice

        recipe["destination"] = recipe["chainTwo"]
        recipe["destination"]["token"]["price"] = chainTwoPrice
    else:
        recipe["origin"] = recipe["chainTwo"]
        recipe["origin"]["token"]["price"] = chainTwoPrice

        recipe["destination"] = recipe["chainOne"]
        recipe["destination"]["token"]["price"] = chainOnePrice

    del recipe['chainOne'], recipe['chainTwo']

    recipe["arbitrage"]["reportString"] = \
        f'Buying {recipe["origin"]["token"]["name"]} on ' \
        f'{recipe["origin"]["chain"]["name"]} @ ' \
        f'{recipe["origin"]["token"]["price"]} {recipe["origin"]["stablecoin"]["symbol"]} ' \
        f'and selling {recipe["destination"]["token"]["name"]} on ' \
        f'{recipe["destination"]["chain"]["name"]} ' \
        f'@ {recipe["destination"]["token"]["price"]} ' \
        f'{recipe["origin"]["stablecoin"]["symbol"]} for a {priceDifference}% arbitrage'

    return recipe

def calculatePotentialProfit(initialCapital, origin, destination, arbitragePlan):
    logger.debug(f"Calculating potential profit")

    tripPredictions = {}
    trips = [1, 2, 5, 10, 20, 100, 250, 500, 1000]

    tripIsProfitible = False

    for tripAmount in trips:

        startingCapital = initialCapital
        currentCapital = startingCapital
        profitLoss = 0

        tripIsProfitible = False

        for _ in repeat(None, tripAmount):

            # Calculate Profit/Loss of a single round trip.
            initialBuy = currentCapital / origin["price"]
            initialBuyAfterBridgeFees = initialBuy - arbitragePlan["origin"]["bridgeFee"]
            arbSell = initialBuyAfterBridgeFees * destination["price"]
            currentCapital = arbSell - (arbitragePlan["destination"]["bridgeFee"] * origin["price"])
            profitLoss = currentCapital - startingCapital
            tripIsProfitible = currentCapital > startingCapital

        if tripIsProfitible:
            logger.info(f"{tripAmount} Round trips would result in a PROFIT [ Total: {currentCapital} | P/L ${profitLoss} ]")
        else:
            logger.info(f"{tripAmount} Round trips would result in a LOSS [ Total: {currentCapital} | P/L ${profitLoss} ]")

        tripPredictions[f"{tripAmount}"] = {"Total": currentCapital, "P/L": profitLoss, "Profitable": tripIsProfitible}

    return tripIsProfitible, tripPredictions

def calculateDifference(pairOne, pairTwo):
    logger.debug(f"Calculating pair difference")
    return abs(round(((pairTwo - pairOne) * 100) / pairOne, 2))

def calculateArbitrageStrategy(n1Price, n1Name, n2Price, n2Name):
    if n1Price < n2Price:
        return n1Name, n2Name
    elif n2Price < n1Price:
        return n2Name, n1Name
    else:
        return None, None

def calculateQueryInterval(recipeCount):
    requestLimit = float(os.environ.get("REQUEST_LIMIT"))
    return 60 / (requestLimit / recipeCount)

def checkArbitrageIsWorthIt(difference):
    # Dex Screen Envs
    threshold = float(os.environ.get("ARBITRAGE_THRESHOLD"))
    if difference >= threshold:
        return True
    else:
        return False

