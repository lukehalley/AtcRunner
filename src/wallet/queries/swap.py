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

def getAmountOut(amount_in, path, rpc_address, factoryAddress, routerAddress):
    one = Web3.toChecksumAddress(path[0])
    two = Web3.toChecksumAddress(path[1])
    pairAddress = Factory.get_pair(token_address_1=one, token_address_2=two, rpc_address=rpc_address,
                                   factoryAddress=factoryAddress)

    pairReserves = Pair.get_reserves(pairAddress, rpc_address)

    result = Router.get_amount_out(
        amount_in=amount_in,
        reserve_in=pairReserves[0],
        reserve_out=pairReserves[1],
        rpc_address=rpc_address,
        routerAddress=routerAddress
    )

    quote = Router.quote(amount_a=amount_in, reserve_a=pairReserves[0], reserve_b=pairReserves[1], rpc_address=rpc_address,
                 routerAddress=routerAddress)

    return result

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

    for tripNumber, settings in swapDict.items():

        position = settings["position"]
        toSwapFrom = settings["toSwapFrom"]

        amountOfStables = recipe[position]["wallet"]["balances"]["stablecoin"]
        amountOfTokens = amountOfStables / recipe[position]["token"]["price"]

        if position == "origin":

            toSwapTo = "token"
            logger.info(f'Estimate: {amountOfStables} {recipe[position][toSwapFrom]["name"]} -> {amountOfTokens} {recipe[position][toSwapTo]["name"]}')
            amountToSwapFrom = amountOfStables
            amountToSwapTo = amountOfTokens
        else:
            toSwapTo = "stablecoin"
            logger.info(f'Estimate: {amountOfTokens} {recipe[position][toSwapFrom]["name"]} -> {amountOfStables} {recipe[position][toSwapTo]["name"]}')
            amountToSwapFrom = amountOfTokens
            amountToSwapTo = amountOfStables

        fromAddress = recipe[position][toSwapFrom]["address"]
        toAddress = recipe[position][toSwapTo]["address"]

        amountInWei = int(getTokenDecimalValue(amountToSwapFrom, recipe[position][toSwapFrom]["decimals"]))
        amountOutWei = int(getTokenDecimalValue(amountToSwapTo, recipe[position][toSwapTo]["decimals"]))

        quote = swapToken(
            tokenToSwapFrom=fromAddress,
            tokenToSwapTo=toAddress,
            amountIn=amountInWei,
            amountOutMin=amountOutWei,
            swappingToGas=False,
            rpcURL=recipe[position]["chain"]["rpc"],
            explorerUrl=recipe[position]["chain"]["blockExplorer"],
            routerAddress=recipe[position]["chain"]["uniswapRouter"],
            factoryAddress=recipe[position]["chain"]["uniswapFactory"],
            justGetQuote=True
        )

        quoteRealValue = float(getTokenNormalValue(quote, recipe[position][toSwapTo]["decimals"]))

        swapFees[tripNumber] = {}

        if position == "origin":
            swapFees[tripNumber] = amountToSwapFrom - (quoteRealValue * recipe[position][toSwapTo]["price"])
        else:
            swapFees[tripNumber] = amountToSwapFrom - (quoteRealValue / recipe[position][toSwapFrom]["price"])

        tokenLoss = amountToSwapTo - quoteRealValue
        estimatedOutput = quoteRealValue

        logger.info(f'Output: {quoteRealValue} {recipe[position][toSwapTo]["name"]} w/ fee: ${swapFees[tripNumber]}')

        printSeperator()

    recipe = addFee(recipe=recipe, fee=swapFees, section="swap")

    logger.info(f"Swap Fees Total: ${recipe['status']['fees']['swap']['subTotal']}")

    return recipe