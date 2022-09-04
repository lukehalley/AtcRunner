import asyncio
import time

from src.chain.swap.swap_Querys import getSwapQuoteOut, getSwapQuoteOutAsync
from src.utils.data.data_Booleans import strToBool
from src.utils.logging.logging_Print import printSeparator
from src.utils.logging.logging_Setup import getProjectLogger
from src.utils.math.math_Decimal import truncateDecimal

logger = getProjectLogger()

def calculateCrossChainStrategy(recipe):

    from src.arbitrage.arbitrage_Calculate import calculateDifference, calculateCrosschainOriginDestinationTokens

    chainOneTokenPrice = getSwapQuoteOut(
        recipe=recipe,
        recipePosition="chainOne",
        recipeDex=recipe["chainOne"]["chain"]["primaryDex"],
        tokenInType="token",
        tokenInAmount=1.0
    )

    chainTwoTokenPrice = getSwapQuoteOut(
        recipe=recipe,
        recipePosition="chainTwo",
        recipeDex=recipe["chainTwo"]["chain"]["primaryDex"],
        tokenInType="token",
        tokenInIsGas=False,
        tokenInAmount=1.0
    )

    chainOneGasPrice = getSwapQuoteOut(
        recipe=recipe,
        recipePosition="chainOne",
        recipeDex=recipe["chainOne"]["chain"]["primaryDex"],
        tokenInType="token",
        tokenInIsGas=True,
        tokenInAmount=1.0
    )

    chainTwoGasPrice = getSwapQuoteOut(
        recipe=recipe,
        recipePosition="chainTwo",
        recipeDex=recipe["chainTwo"]["chain"]["primaryDex"],
        tokenInType="token",
        tokenInIsGas=True,
        tokenInAmount=1.0
    )

    priceDifference = calculateDifference(chainOneTokenPrice, chainTwoTokenPrice)

    origin, destination = calculateCrosschainOriginDestinationTokens(chainOneTokenPrice, recipe["chainOne"]["chain"]["name"],
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
            errMsg = f'Invalid topUpDirection lock: {directionlock}'
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

    printSeparator()

    if directionLockEnabled:
        logger.info(f'[ARB #{recipe["status"]["currentRoundTrip"]}] Locked Arbitrage Opportunity Identified')
    else:
        logger.info(f'[ARB #{recipe["status"]["currentRoundTrip"]}] Arbitrage Opportunity Identified')

    printSeparator()

    logger.info(
        f'Buy: {recipe["origin"]["token"]["name"]} @ ${truncateDecimal(recipe["origin"]["token"]["price"], 6)} on '
        f'{recipe["origin"]["chain"]["name"]}'
    )

    logger.info(
        f'Sell: {recipe["destination"]["token"]["name"]} @ ${truncateDecimal(recipe["destination"]["token"]["price"], 6)} on '
        f'{recipe["destination"]["chain"]["name"]} '
    )

    printSeparator()

    logger.info(
        f'Arbitrage: {priceDifference}% difference'
    )

    del recipe["chainOne"], recipe["chainTwo"]

    return recipe

async def calculateInternalChainStrategy(recipe):

    from src.arbitrage.arbitrage_Calculate import calculateDifference, calculateCrosschainOriginDestinationTokens

    priceDict = {}

    # for tokenDetails in recipe["chainOne"]["tokenList"]:

    tokenList = recipe["chainOne"]["tokenList"]
    shortTokenList = tokenList[0:29]

    s = time.perf_counter()

    tasks = [getTokenQuote(recipe=recipe, tokenDetails=token) for token in tokenList]
    prices = await asyncio.gather(*tasks)

    finalPrices = [item for item in prices if item["prices"] and len(item["prices"].keys()) > 1]

    # priceDifference = calculateDifference(chainOneTokenPrice, chainTwoTokenPrice)
    #
    # origin, destination = calculateCrosschainOriginDestinationTokens(chainOneTokenPrice, recipe["chainOne"]["chain"]["name"],
    #                                                                  chainTwoTokenPrice, recipe["chainTwo"]["chain"]["name"])
    #
    # logger.debug(f"Calculating data origin and destination")
    #
    # directionLockEnabled = strToBool(recipe["arbitrage"]["directionLock"]["lockEnabled"])
    #
    # if directionLockEnabled:
    #     directionlock = recipe["arbitrage"]["directionLock"]["direction"].split(",")
    #
    #     originLock = directionlock[0]
    #     destinationLock = directionlock[1]
    #
    #     if recipe["chainOne"]["chain"]["name"] == originLock and recipe["chainTwo"]["chain"]["name"] == destinationLock:
    #
    #         recipe["origin"] = recipe["chainOne"]
    #         recipe["origin"]["token"]["price"] = chainOneTokenPrice
    #         recipe["origin"]["gas"]["price"] = chainOneGasPrice
    #
    #         recipe["destination"] = recipe["chainTwo"]
    #         recipe["destination"]["token"]["price"] = chainTwoTokenPrice
    #         recipe["destination"]["gas"]["price"] = chainTwoGasPrice
    #
    #     elif recipe["chainTwo"]["chain"]["name"] == originLock and recipe["chainOne"]["chain"][
    #         "name"] == destinationLock:
    #
    #         recipe["origin"] = recipe["chainTwo"]
    #         recipe["origin"]["token"]["price"] = chainTwoTokenPrice
    #         recipe["origin"]["gas"]["price"] = chainTwoGasPrice
    #
    #         recipe["destination"] = recipe["chainOne"]
    #         recipe["destination"]["token"]["price"] = chainOneTokenPrice
    #         recipe["destination"]["gas"]["price"] = chainOneGasPrice
    #
    #     else:
    #         errMsg = f'Invalid topUpDirection lock: {directionlock}'
    #         logger.error(errMsg)
    #         raise Exception(errMsg)
    #
    # else:
    #     if origin == recipe["chainOne"]["chain"]["name"]:
    #
    #         recipe["origin"] = recipe["chainOne"]
    #         recipe["origin"]["token"]["price"] = chainOneTokenPrice
    #         recipe["origin"]["gas"]["price"] = chainOneGasPrice
    #
    #         recipe["destination"] = recipe["chainTwo"]
    #         recipe["destination"]["token"]["price"] = chainTwoTokenPrice
    #         recipe["destination"]["gas"]["price"] = chainTwoGasPrice
    #     else:
    #         recipe["origin"] = recipe["chainTwo"]
    #         recipe["origin"]["token"]["price"] = chainTwoTokenPrice
    #         recipe["origin"]["gas"]["price"] = chainTwoGasPrice
    #
    #         recipe["destination"] = recipe["chainOne"]
    #         recipe["destination"]["token"]["price"] = chainOneTokenPrice
    #         recipe["destination"]["gas"]["price"] = chainOneGasPrice
    #
    # printSeparator()
    #
    # if directionLockEnabled:
    #     logger.info(f'[ARB #{recipe["status"]["currentRoundTrip"]}] Locked Arbitrage Opportunity Identified')
    # else:
    #     logger.info(f'[ARB #{recipe["status"]["currentRoundTrip"]}] Arbitrage Opportunity Identified')
    #
    # printSeparator()
    #
    # logger.info(
    #     f'Buy: {recipe["origin"]["token"]["name"]} @ ${truncateDecimal(recipe["origin"]["token"]["price"], 6)} on '
    #     f'{recipe["origin"]["chain"]["name"]}'
    # )
    #
    # logger.info(
    #     f'Sell: {recipe["destination"]["token"]["name"]} @ ${truncateDecimal(recipe["destination"]["token"]["price"], 6)} on '
    #     f'{recipe["destination"]["chain"]["name"]} '
    # )
    #
    # printSeparator()
    #
    # logger.info(
    #     f'Arbitrage: {priceDifference}% difference'
    # )
    #
    # del recipe["chainOne"], recipe["chainTwo"]

    e = time.perf_counter()

    res = e - s
    print(res)

    return recipe

async def getTokenQuote(recipe, tokenDetails):

    tokenPrices = {}

    tokenRoute = [routeSymbol.replace('{TOKEN_ADDRESS}', tokenDetails["address"]) for routeSymbol in
                  recipe["chainOne"]["routes"]["token-stablecoin"]]

    tokenSymbol = tokenDetails["symbol"]

    for dexName, dexDetails in recipe["chainOne"]["dexs"].items():
        quote = await getSwapQuoteOutAsync(
            recipe=recipe,
            recipePosition="chainOne",
            recipeDex=dexDetails,
            tokenInDetails=tokenDetails,
            tokenInAmount=1.0,
            tokenInType="token",
            tokenOutDetails=recipe["chainOne"]["stablecoin"],
            routeOverride=tokenRoute
        )

        if quote > 0:
            tokenPrices[dexName] = quote

    if len(tokenPrices.keys()) > 1:
        print(tokenSymbol, tokenPrices)

    resultObject = {
        "token": tokenSymbol,
        "prices": tokenPrices
    }

    return resultObject