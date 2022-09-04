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

def getSwapQuoteOut(recipe, recipePosition, recipeDex, tokenInDetails, tokenInAmount, tokenInType, tokenOutDetails):

    # Dict Params ####################################################
    tokenInIsGas = tokenInDetails["isGas"]
    tokenInDecimals = tokenInDetails["decimals"]
    tokenOutDecimals = tokenOutDetails["decimals"]
    rpcUrl = recipe[recipePosition]["chain"]["rpc"]
    routerAddress = recipe[recipePosition]["dexs"][recipeDex]["router"]["address"]
    routerABI = recipe[recipePosition]["dexs"][recipeDex]["router"]["abi"]
    routerABIMappings = recipe[recipePosition]["dexs"][recipeDex]["router"]["mapping"]
    # Dict Params ####################################################

    if tokenInIsGas:
        routes = [recipe[recipePosition]["gas"]["address"], recipe[recipePosition]["stablecoin"]["address"]]
    else:
        routes = getRoutes(
            recipe=recipe,
            recipePosition=recipePosition,
            tokenType=tokenInType
        )

    normalisedRoutes = normaliseSwapRoutes(routes)

    amountInWei = int(getTokenDecimalValue(tokenInAmount, tokenInDecimals))

    out = getAmountsOut(
        amount_in=amountInWei,
        addresses=normalisedRoutes,
        rpc_address=rpcUrl,
        routerAddress=routerAddress,
        routerABI=routerABI,
        routerABIMappings=routerABIMappings
    )

    amountOutWei = out[-1]

    quote = getTokenNormalValue(amountOutWei, tokenOutDecimals)

    return quote

def getSwapQuoteIn(recipe, recipePosition, recipeDex, tokenInType, tokenOutType, tokenOutIsGas, tokenOutAmount):

    # Dict Params ####################################################
    amountInDecimals = recipe[recipePosition][tokenInType]["decimals"]
    amountOutDecimals = recipe[recipePosition][tokenOutType]["decimals"]
    rpcUrl = recipe[recipePosition]["chain"]["rpc"]
    routerAddress = recipe[recipePosition]["dexs"][recipeDex]["router"]["address"]
    routerABI = recipe[recipePosition]["dexs"][recipeDex]["router"]["abi"]
    # Dict Params ####################################################

    if tokenOutIsGas:
        routes = [recipe[recipePosition][tokenInType]["address"], recipe[recipePosition]["gas"]["address"]]
    else:
        routes = getRoutes(
            recipe=recipe,
            recipePosition=recipePosition,
            tokenType=tokenOutType
        )

    normalisedRoutes = normaliseSwapRoutes(routes)

    amountWei = int(getTokenDecimalValue(tokenOutAmount, amountOutDecimals))

    out = getAmountsIn(
        amount_out=amountWei,
        addresses=normalisedRoutes,
        rpc_address=rpcUrl,
        routerAddress=routerAddress,
        routerABI=routerABI
    )

    quote = getTokenNormalValue(out[0], amountInDecimals)

    return quote
