import os, sys, logging
from itertools import repeat
from helpers import Dex, Utils, Wallet

logger = logging.getLogger("DFK-DEX")



def setUpArbitrage(recipe):

    logger.debug(f"Calling Dexscreener API to find current price of pair")

    # chainOnePrice = Dex.getTokenPriceByDexId(recipe["chainOne"]["chain"]["name"], recipe["chainOne"]["token"]["address"], recipe["arbitrage"]["dexId"])
    # chainTwoPrice = Dex.getTokenPriceByDexId(recipe["chainTwo"]["chain"]["name"], recipe["chainTwo"]["token"]["address"], recipe["arbitrage"]["dexId"])

    chainOnePrice, chainTwoPrice = Wallet.getOnChainPrice(recipe)

    priceDifference = calculateDifference(chainOnePrice, chainTwoPrice)

    origin, destination = calculateArbitrageStrategy(chainOnePrice, recipe["chainOne"]["chain"]["name"], chainTwoPrice, recipe["chainTwo"]["chain"]["name"])
    logger.debug(f"Calculating arbitrage origin and destination")

    recipe["arbitrage"]["directionLockEnabled"] = Utils.strToBool(os.getenv("DIRECTION_LOCK_ENABLED"))

    if recipe["arbitrage"]["directionLockEnabled"] and "directionLock" in recipe["arbitrage"]:
        directionlock = recipe["arbitrage"]["directionLock"].split(",")

        originLock = directionlock[0]
        destinationLock = directionlock[1]

        if recipe["chainOne"]["chain"]["name"] == originLock and recipe["chainTwo"]["chain"]["name"] == destinationLock:

            recipe["origin"] = recipe["chainOne"]
            recipe["origin"]["token"]["price"] = chainOnePrice

            recipe["destination"] = recipe["chainTwo"]
            recipe["destination"]["token"]["price"] = chainTwoPrice

        elif recipe["chainTwo"]["chain"]["name"] == originLock and recipe["chainOne"]["chain"]["name"] == destinationLock:

            recipe["origin"] = recipe["chainTwo"]
            recipe["origin"]["token"]["price"] = chainTwoPrice

            recipe["destination"] = recipe["chainOne"]
            recipe["destination"]["token"]["price"] = chainOnePrice

        else:
            errMsg = f'Invalid direction lock: {directionlock}'
            logger.error(errMsg)
            sys.exit(errMsg)

    else:
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

    # del recipe['chainOne'], recipe['chainTwo']

    recipe["info"] = {}

    recipe["info"]["reportString"] = \
        f'Buying {recipe["origin"]["token"]["name"]} on ' \
        f'{recipe["origin"]["chain"]["name"]} @ ' \
        f'{recipe["origin"]["token"]["price"]} {recipe["origin"]["stablecoin"]["symbol"]} ' \
        f'and selling {recipe["destination"]["token"]["name"]} on ' \
        f'{recipe["destination"]["chain"]["name"]} ' \
        f'@ {recipe["destination"]["token"]["price"]} ' \
        f'{recipe["origin"]["stablecoin"]["symbol"]} for a {priceDifference}% arbitrage'

    return recipe

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

