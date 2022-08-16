from src.apis.synapseBridge.synapseBridge_Estimate import estimateBridgeOutput
from src.arbitrage.arbitrage_Utils import getRoutes
from src.utils.chain.chain_Calculations import getOppositeDirection
from src.utils.files.files_Directory import getProjectLogger
from src.wallet.queries.swap import getSwapQuoteOut

# Set up our logging
logger = getProjectLogger()

# Simulate an arbitrage step
def simulateStep(recipe, stepSettings, currentFunds):
    stepType = stepSettings["type"]
    position = stepSettings["position"]
    oppositePosition = getOppositeDirection(position)

    toSwapFrom = stepSettings["from"]
    toSwapTo = stepSettings["to"]

    if stepType == "swap":
        routeAddressList = getRoutes(recipe=recipe, position=position, toSwapFrom=toSwapFrom, toSwapTo=toSwapTo)

        quote = getSwapQuoteOut(
            amountInNormal=currentFunds[toSwapFrom],
            amountInDecimals=recipe[position][toSwapFrom]["decimals"],
            amountOutDecimals=recipe[position][toSwapTo]["decimals"],
            rpcUrl=recipe[position]["chain"]["rpc"],
            routerAddress=recipe[position]["chain"]["contracts"]["router"]["address"],
            routerABI=recipe[position]["chain"]["contracts"]["router"]["abi"],
            routerABIMappings=recipe[position]["chain"]["contracts"]["router"]["mapping"],
            routes=routeAddressList
        )

    elif stepType == "bridge":
        quote = estimateBridgeOutput(
            fromChain=recipe[position]["chain"]["id"],
            toChain=recipe[oppositePosition]["chain"]["id"],
            fromToken=recipe[position][toSwapFrom]["address"],
            toToken=recipe[oppositePosition][toSwapFrom]['address'],
            amountToBridge=currentFunds[toSwapFrom],
            decimalPlacesFrom=recipe[position][toSwapFrom]["decimals"],
            decimalPlacesTo=recipe[oppositePosition][toSwapFrom]["decimals"],
            returning=(not position == "origin"))
    else:
        errMsg = f'Invalid Arbitrage simulation type: {stepType}'
        logger.error(errMsg)
        raise Exception(errMsg)

    return quote