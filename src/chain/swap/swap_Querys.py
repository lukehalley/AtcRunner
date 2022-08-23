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

def normaliseSwapRoutes(routes):
    normalisedRoutes = []

    for route in routes:
        normalisedAddress = Web3.toChecksumAddress(route)

        if normalisedAddress not in normalisedRoutes:
            normalisedRoutes.append(Web3.toChecksumAddress(route))

    return normalisedRoutes

def getSwapQuoteOut(recipe, recipePosition, tokenType, tokenIsGas, tokenAmountIn):
    # Dict Params ####################################################
    oppositeRecipeToken = getOppositeToken(tokenType)
    amountInDecimals = recipe[recipePosition][tokenType]["decimals"]
    amountOutDecimals = recipe[recipePosition][oppositeRecipeToken]["decimals"]
    rpcUrl = recipe[recipePosition]["chain"]["rpc"]
    routerAddress = recipe[recipePosition]["chain"]["contracts"]["router"]["address"]
    routerABI = recipe[recipePosition]["chain"]["contracts"]["router"]["abi"]
    routerABIMappings = recipe[recipePosition]["chain"]["contracts"]["router"]["mapping"]
    # Dict Params ####################################################

    if tokenIsGas:
        routes = [recipe[recipePosition]["gas"]["address"], recipe[recipePosition]["stablecoin"]["address"]]
    else:
        routes = getRoutes(
            recipe=recipe,
            recipePosition=recipePosition,
            tokenType=tokenType
        )

    normalisedRoutes = normaliseSwapRoutes(routes)

    amountInWei = int(getTokenDecimalValue(tokenAmountIn, amountInDecimals))

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

def getSwapQuoteIn(recipe, recipePosition, tokenType, tokenIsGas, tokenAmountOut):

    # Dict Params ####################################################
    amountOutDecimals = recipe[recipePosition][tokenType]["decimals"]
    amountInDecimals = recipe[recipePosition][tokenType]["decimals"]
    rpcUrl = recipe[recipePosition]["chain"]["rpc"]
    routerAddress = recipe[recipePosition]["chain"]["contracts"]["router"]["address"]
    routerABI = recipe[recipePosition]["chain"]["contracts"]["router"]["abi"]
    # Dict Params ####################################################

    if tokenIsGas:
        routes = [recipe[recipePosition]["gas"]["address"], recipe[recipePosition]["stablecoin"]["address"]]
    else:
        routes = getRoutes(
            recipe=recipe,
            recipePosition=recipePosition,
            tokenType=tokenType
        )

    normalisedRoutes = normaliseSwapRoutes(routes)

    amountWei = int(getTokenDecimalValue(tokenAmountOut, amountOutDecimals))

    out = getAmountsIn(
        amount_out=amountWei,
        addresses=normalisedRoutes,
        rpc_address=rpcUrl,
        routerAddress=routerAddress,
        routerABI=routerABI
    )

    quote = getTokenNormalValue(out[0], amountInDecimals)

    return quote
