import os

from retry import retry
from web3 import Web3

from src.arbitrage.arbitrage_Utils import getOppositeToken, getRoutes
from src.chain.contract.contract_Router import getAmountsOut, getAmountsIn
from src.utils.chain.chain_Wei import getTokenDecimalValue, getTokenNormalValue
from src.utils.logging.logging_Setup import getProjectLogger

logger = getProjectLogger()

transactionRetryLimit = int(os.environ.get("TRANSACTION_QUERY_RETRY_LIMIT"))
transactionRetryDelay = int(os.environ.get("TRANSACTION_QUERY_RETRY_DELAY"))

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def normaliseSwapRoutes(routes):
    normalisedRoutes = []

    for route in routes:
        normalisedAddress = Web3.toChecksumAddress(route)

        if normalisedAddress not in normalisedRoutes:
            normalisedRoutes.append(Web3.toChecksumAddress(route))

    return normalisedRoutes

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getSwapQuoteOut(recipe, recipeDirection, recipeToken, recipeTokenIsGas, amountInNormal):

    oppositeRecipeToken = getOppositeToken(recipeToken)

    amountInDecimals = recipe[recipeDirection][recipeToken]["decimals"]
    amountOutDecimals = recipe[recipeDirection][oppositeRecipeToken]["decimals"]

    rpcUrl = recipe[recipeDirection]["chain"]["rpc"]

    routerAddress = recipe[recipeDirection]["chain"]["contracts"]["router"]["address"]
    routerABI = recipe[recipeDirection]["chain"]["contracts"]["router"]["abi"]
    routerABIMappings = recipe[recipeDirection]["chain"]["contracts"]["router"]["mapping"]

    if recipeTokenIsGas:
        routes = [recipe[recipeDirection]["gas"]["address"], recipe[recipeDirection]["stablecoin"]["address"]]
    else:
        routes = getRoutes(
            recipe=recipe,
            position=recipeDirection,
            toSwapFrom=recipeToken,
            toSwapTo=oppositeRecipeToken)

    normalisedRoutes = normaliseSwapRoutes(routes)

    amountInWei = int(getTokenDecimalValue(amountInNormal, amountInDecimals))

    out = getAmountsOut(
        amount_in=amountInWei,
        addresses=normalisedRoutes,
        rpc_address=rpcUrl,
        routerAddress=routerAddress,
        routerABI=routerABI,
        routerABIMappings=routerABIMappings
    )

    amountOutWei = out[-1]

    quote = getTokenNormalValue(amountOutWei, amountOutDecimals)

    return quote

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getSwapQuoteIn(recipe, recipeDirection, recipeToken, recipeTokenIsGas, amountOutNormal):

    oppositeRecipeToken = getOppositeToken(recipeToken)

    amountInDecimals = recipe[recipeDirection][recipeToken]["decimals"]
    amountOutDecimals = recipe[recipeDirection][oppositeRecipeToken]["decimals"]

    rpcUrl = recipe[recipeDirection]["chain"]["rpc"]

    routerAddress = recipe[recipeDirection]["chain"]["contracts"]["router"]["address"]
    routerABI = recipe[recipeDirection]["chain"]["contracts"]["router"]["abi"]
    routerABIMappings = recipe[recipeDirection]["chain"]["contracts"]["router"]["mapping"]

    if recipeTokenIsGas:
        routes = [recipe[recipeDirection]["gas"]["address"], recipe[recipeDirection]["stablecoin"]["address"]]
    else:
        routes = getRoutes(
            recipe=recipe,
            position=recipeDirection,
            toSwapFrom=recipeToken,
            toSwapTo=oppositeRecipeToken)

    normalisedRoutes = normaliseSwapRoutes(routes)

    amountWei = int(getTokenDecimalValue(amountOutNormal, amountOutDecimals))

    out = getAmountsIn(
        amount_out=amountWei,
        addresses=normalisedRoutes,
        rpc_address=rpcUrl,
        routerAddress=routerAddress,
        routerABI=routerABI
    )

    quote = getTokenNormalValue(out[0], amountInDecimals)

    return quote




