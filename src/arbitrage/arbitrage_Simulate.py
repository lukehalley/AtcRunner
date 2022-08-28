from src.apis.synapseBridge.synapseBridge_Estimate import estimateBridgeOutput
from src.arbitrage.arbitrage_Utils import getOppositePosition, getRoutes
from src.chain.swap.swap_Querys import getSwapQuoteOut
from src.utils.logging.logging_Setup import getProjectLogger

logger = getProjectLogger()


# Simulate an arbitrage step
def simulateStep(recipe, stepSettings, currentFunds):

    stepType = stepSettings["type"]
    position = stepSettings["position"]
    oppositePosition = getOppositePosition(position)

    toSwapFrom = stepSettings["from"]

    if stepType == "swap":

        quote = getSwapQuoteOut(
            recipe=recipe,
            recipePosition=position,
            recipeDex=recipe[position]["chain"]["primaryDex"],
            tokenType=toSwapFrom,
            tokenIsGas=recipe[position][toSwapFrom]["isGas"],
            tokenAmountIn=currentFunds[toSwapFrom]
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
