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

def getAmountIn(amount_out, path, rpc_address, factoryAddress, routerAddress):

    one = Web3.toChecksumAddress(path[0])
    two = Web3.toChecksumAddress(path[1])
    pairAddress = Factory.get_pair(token_address_1=one, token_address_2=two, rpc_address=rpc_address,factoryAddress=factoryAddress)

    pairReserves = Pair.get_reserves(pairAddress, rpc_address)

    priceWei = Router.get_amount_in(
        amount_out=amount_out,
        reserve_in=pairReserves[0],
        reserve_out=pairReserves[1],
        rpc_address=rpc_address,
        routerAddress=routerAddress
    )

    return priceWei

def getSwapQuoteIn(amountInNormal, fromAddress, fromDecimals, toAddress, toDecimals, rpcUrl, factoryAddress, routerAddress):

    amountWei = int(getTokenDecimalValue(amountInNormal, fromDecimals))

    fromAddressCS = Web3.toChecksumAddress(fromAddress)
    toAddressCS = Web3.toChecksumAddress(toAddress)

    pairAddress = Factory.get_pair(token_address_1=fromAddressCS, token_address_2=toAddressCS, rpc_address=rpcUrl, factoryAddress=factoryAddress)

    pairReserves = Pair.get_reserves(pairAddress, rpcUrl)

    priceWei = Router.get_amount_in(
        amount_out=amountWei,
        reserve_in=pairReserves[0],
        reserve_out=pairReserves[1],
        rpc_address=rpcUrl,
        routerAddress=routerAddress
    )

    price = float(getTokenNormalValue(priceWei, toDecimals))

    return price

def getSwapQuoteOut(amountInNormal, routes, fromDecimals, toDecimals, rpcUrl, factoryAddress, routerAddress):

    normalisedRoutes = []

    for route in routes:
        normalisedRoutes.append(Web3.toChecksumAddress(route))

    amountWei = int(getTokenDecimalValue(amountInNormal, fromDecimals))

    out = Router.get_amounts_out(
        amount_in=amountWei,
        addresses=normalisedRoutes,
        rpc_address=rpcUrl,
        routerAddress=routerAddress
    )

    return float(getTokenNormalValue(out[-1], toDecimals))

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
            toDecimals = recipe[position]["routes"][toSwapFrom][-1]["decimals"]
        else:
            routes = [recipe[position][toSwapFrom]["address"], recipe[position][toSwapTo]["address"]]
            toDecimals = recipe[position][toSwapTo]["decimals"]

        quote = getSwapQuoteOut(
            amountInNormal=amountToSwap,
            fromDecimals=recipe[position][toSwapFrom]["decimals"],
            toDecimals=toDecimals,
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



