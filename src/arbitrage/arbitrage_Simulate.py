
from src.apis.synapseBridge.synapseBridge_Estimate import estimateBridgeOutput
from src.arbitrage.arbitrage_Utils import getOppositeDirection, getRoutes
from src.chain.swap.swap_Querys import getSwapQuoteOut
from src.utils.logging.logging_Setup import getProjectLogger

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
            routerAddress=recipe[position]["chain"]["contract"]["router"]["address"],
            routerABI=recipe[position]["chain"]["contract"]["router"]["abi"],
            routerABIMappings=recipe[position]["chain"]["contract"]["router"]["mapping"],
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