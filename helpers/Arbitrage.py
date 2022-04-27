import logging
import os
import requests
from itertools import repeat
import helpers.Database as Database

logger = logging.getLogger("DFK-DEX")

def calculateArbitrage(chainOne, chainTwo):

    logger.debug(f"Calling Dexscreener API to find current price of pair")

    # Dex Screen Envs
    pairsEndpoint = os.environ.get("DEXSCREENER_API_ENDPOINT")

    # Network One
    chainOneEndpoint = f"{pairsEndpoint}/{chainOne['chain']}/{chainOne['tokenDexPair']}"
    chainOneResult = requests.get(chainOneEndpoint)
    chainOneResultJSON = chainOneResult.json()["pair"]
    chainOnePrice = float(chainOneResultJSON["priceUsd"])

    # Network Two
    chainTwoEndpoint = f"{pairsEndpoint}/{chainTwo['chain']}/{chainTwo['tokenDexPair']}"
    chainTwoResult = requests.get(chainTwoEndpoint)
    chainTwoResultJSON = chainTwoResult.json()["pair"]
    chainTwoPrice = float(chainTwoResultJSON["priceUsd"])

    # Calculate
    priceDifference = calculateDifference(chainOnePrice, chainTwoPrice)

    arbitrageOrigin, arbitrageDestination = calculateArbitrageStrategy(chainOnePrice, chainOne['chain'], chainTwoPrice,
                                                                       chainTwo['chain'])
    logger.debug(f"Calculating arbitrage origin and destination")

    if arbitrageOrigin == chainOne["chain"]:
        arbitrageOriginDetails = chainOne
        arbitrageOriginDetails["price"] = chainOnePrice

        arbitrageDestinationDetails = chainTwo
        arbitrageDestinationDetails["price"] = chainTwoPrice
    else:
        arbitrageOriginDetails = chainTwo
        arbitrageOriginDetails["price"] = chainTwoPrice

        arbitrageDestinationDetails = chainOne
        arbitrageDestinationDetails["price"] = chainOnePrice

    reportString = f"Buying {arbitrageOriginDetails['token']} on {arbitrageOriginDetails['readableChain']} @ {arbitrageOriginDetails['price']} {arbitrageOriginDetails['stablecoin']} and selling {arbitrageDestinationDetails['token']} on {arbitrageDestinationDetails['readableChain']} @ {arbitrageDestinationDetails['price']} {arbitrageDestinationDetails['stablecoin']} for a {priceDifference}% arbitrage"

    return reportString, priceDifference, arbitrageOriginDetails, arbitrageDestinationDetails

def calculatePotentialProfit(initialCapital, arbitrageOrigin, arbitrageDestination, bridgePlan):
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
            initialBuy = currentCapital / arbitrageOrigin["price"]
            initialBuyAfterBridgeFees = initialBuy - bridgePlan["arbitrageOrigin"]["bridgeFee"]
            arbSell = initialBuyAfterBridgeFees * arbitrageDestination["price"]
            currentCapital = arbSell - (bridgePlan["arbitrageDestination"]["bridgeFee"] * arbitrageOrigin["price"])
            profitLoss = currentCapital - startingCapital
            tripIsProfitible = currentCapital > startingCapital

        if tripIsProfitible:
            logger.info(f"{tripAmount} Round trips would in a PROFIT [ Total: {currentCapital} | P/L ${profitLoss} ]")
        else:
            logger.info(f"{tripAmount} Round trips would in a LOSS [ Total: {currentCapital} | P/L ${profitLoss} ]")

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

