import os, sys, logging
from itertools import repeat

from src.utils.general import strToBool
from src.api.dexscreener import getTokenPriceByDexId
from src.wallet.queries.network import getOnChainPriceIn, getOnChainPriceOut

# Set up our logging
logger = logging.getLogger("DFK-DEX")

# Determine our arbitrage strategy
def determineArbitrageStrategy(recipe):

    logger.debug(f"Calling Dexscreener API to find current price of pair")

    oldChainOnePrice = getTokenPriceByDexId(recipe["chainOne"]["chain"]["name"], recipe["chainOne"]["token"]["address"], recipe["arbitrage"]["dexId"])
    oldChainTwoPrice = getTokenPriceByDexId(recipe["chainTwo"]["chain"]["name"], recipe["chainTwo"]["token"]["address"], recipe["arbitrage"]["dexId"])

    chainOneTokenPrice = getOnChainPriceOut(
        fromAddress=recipe["chainOne"]["token"]["address"],
        fromDecimals=recipe["chainOne"]["token"]["decimals"],
        toAddress=recipe["chainOne"]["stablecoin"]["address"],
        toDecimals=recipe["chainOne"]["stablecoin"]["decimals"],
        rpcUrl=recipe["chainOne"]["chain"]["rpc"],
        factoryAddress=recipe["chainOne"]["chain"]["uniswapFactory"],
        routerAddress=recipe["chainOne"]["chain"]["uniswapRouter"]
    )

    chainTwoTokenPrice = getOnChainPriceOut(
        fromAddress=recipe["chainTwo"]["stablecoin"]["address"],
        fromDecimals=recipe["chainTwo"]["stablecoin"]["decimals"],
        toAddress=recipe["chainTwo"]["token"]["address"],
        toDecimals=recipe["chainTwo"]["token"]["decimals"],
        rpcUrl=recipe["chainTwo"]["chain"]["rpc"],
        factoryAddress=recipe["chainTwo"]["chain"]["uniswapFactory"],
        routerAddress=recipe["chainTwo"]["chain"]["uniswapRouter"]
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

            recipe["destination"] = recipe["chainTwo"]
            recipe["destination"]["token"]["price"] = chainTwoTokenPrice
        else:
            recipe["origin"] = recipe["chainTwo"]
            recipe["origin"]["token"]["price"] = chainTwoTokenPrice

            recipe["destination"] = recipe["chainOne"]
            recipe["destination"]["token"]["price"] = chainOneTokenPrice

    # del recipe['chainOne'], recipe['chainTwo']

    recipe["info"] = {}

    recipe["info"]["reportString"] = \
        f'Buying {recipe["origin"]["token"]["name"]} on ' \
        f'{recipe["origin"]["chain"]["name"]} @ ' \
        f'{recipe["origin"]["token"]["price"]} {recipe["origin"]["stablecoin"]["symbol"]} ' \
        f'and selling {recipe["destination"]["token"]["name"]} on ' \
        f'{recipe["destination"]["chain"]["name"]} ' \
        f'@ {recipe["destination"]["token"]["price"]} ' \
        f'{recipe["origin"]["stablecoin"]["symbol"]} for a {priceDifference}% data'

    return recipe

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