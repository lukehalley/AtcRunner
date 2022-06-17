import logging
from web3 import Web3

from src.utils.general import printSeperator
from src.api.synapsebridge import getTokenDecimalValue, getTokenNormalValue
from src.data.fees import addFee
from src.wallet.actions.swap import swapToken

import dex.uniswap_v2_pair as Pair
import dex.uniswap_v2_factory as Factory
import dex.uniswap_v2_router as Router

# Set up our logging
logger = logging.getLogger("DFK-DEX")

def getSwapQuoteOut(amountInNormal, amountInDecimals, amountOutDecimals, routes,  rpcUrl, routerAddress):

    normalisedRoutes = []

    for route in routes:
        normalisedRoutes.append(Web3.toChecksumAddress(route))

    amountWei = int(getTokenDecimalValue(amountInNormal, amountInDecimals))

    out = Router.get_amounts_out(
        amount_in=amountWei,
        addresses=normalisedRoutes,
        rpc_address=rpcUrl,
        routerAddress=routerAddress
    )

    return float(getTokenNormalValue(out[-1], amountOutDecimals))

def getSwapQuoteIn(amountOutNormal, amountOutDecimals, amountInDecimals, routes,  rpcUrl, routerAddress):

    normalisedRoutes = []

    for route in routes:
        normalisedRoutes.append(Web3.toChecksumAddress(route))

    amountWei = int(getTokenDecimalValue(amountOutNormal, amountOutDecimals))

    out = Router.get_amounts_in(
        amount_out=amountWei,
        addresses=normalisedRoutes,
        rpc_address=rpcUrl,
        routerAddress=routerAddress
    )

    return float(getTokenNormalValue(out[0], amountInDecimals))

def calculateSwapOutputs(recipe):

    swapDict = {
        "tripOne": {
            "toSwapFrom": "stablecoin",
            "position": "origin"
        },
        "tripTwo": {
            "toSwapFrom": "token",
            "position": "destination"
        },
        "tripThree": {
            "toSwapFrom": "stablecoin",
            "position": "origin"
        },
    }

    printSeperator()
    logger.info(f"[ARB #{recipe['info']['currentRoundTripCount']}] "
                f"Calculating Swap Fees For Arbitrage")
    printSeperator()

    swapFees = {}

    currentStables = 0
    currentTokens = 0

    for tripNumber, settings in swapDict.items():

        position = settings["position"]
        toSwapFrom = settings["toSwapFrom"]

        if not "predictions" in recipe[position]["wallet"]:
            recipe[position]["wallet"]["predictions"] = {}

        if currentStables <=0:
            currentStables = recipe[position]["wallet"]["balances"]["stablecoin"]
            amountOfStables = currentStables
        else:
            amountOfStables = currentStables

        if position == "origin":
            toSwapTo = "token"
            logger.info(f'Estimate: {amountOfStables} {recipe[position][toSwapFrom]["name"]} -> {recipe[position][toSwapTo]["name"]}')
            amountToSwap = amountOfStables
        else:
            toSwapTo = "stablecoin"
            logger.info(f'Estimate: {currentTokens} {recipe[position][toSwapFrom]["name"]} -> {recipe[position][toSwapTo]["name"]}')
            amountToSwap = currentTokens

        hasCustomRoutes = "routes" in recipe[position] and toSwapFrom in recipe[position]["routes"]

        routes = []
        if hasCustomRoutes:
            for route in recipe[position]["routes"][toSwapFrom]:
                routes.append(route["address"])
            amountOutDecimals = recipe[position]["routes"][toSwapFrom][-1]["decimals"]
        else:
            routes = [recipe[position][toSwapFrom]["address"], recipe[position][toSwapTo]["address"]]
            amountOutDecimals = recipe[position][toSwapTo]["decimals"]

        quote = getSwapQuoteOut(
            amountInNormal=amountToSwap,
            amountInDecimals=recipe[position][toSwapFrom]["decimals"],
            amountOutDecimals=amountOutDecimals,
            rpcUrl=recipe[position]["chain"]["rpc"],
            routerAddress=recipe[position]["chain"]["uniswapRouter"],
            factoryAddress=recipe[position]["chain"]["uniswapFactory"],
            routes=routes
        )

        swapFees[tripNumber] = {}

        if toSwapTo == "token":
            currentTokens = quote
            valueAfterSwap = currentTokens * recipe[position][toSwapTo]["price"]
            feeAmount = amountToSwap - valueAfterSwap

            recipe[position]["wallet"]["predictions"][toSwapTo] = currentTokens

        else:
            currentStables = quote
            tokenLoss = amountToSwap - (currentStables / recipe[position][toSwapFrom]["price"])
            feeAmount = tokenLoss * recipe[position][toSwapFrom]["price"]

            recipe[position]["wallet"]["predictions"][toSwapTo] = currentStables

        swapFees[tripNumber] = feeAmount

        logger.info(f'Output: {quote} {recipe[position][toSwapTo]["name"]} w/ fee: ${feeAmount}')

        printSeperator()

    recipe = addFee(recipe=recipe, fee=swapFees, section="swap")

    logger.info(f"Swap Fees Total: ${recipe['status']['fees']['swap']['subTotal']}")

    return recipe



