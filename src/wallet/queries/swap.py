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

def getOnChainPrice(recipe):

    priceDict = {
        "chainOne": 0,
        "chainTwo": 0
    }

    printSeperator()
    logger.info(f"Getting on chain price for tokens")
    printSeperator()

    for position, price in priceDict.items():

        if position == "chainTwo":
            x = 1

        fromAddress = recipe[position]["token"]["address"]
        toAddress = recipe[position]["stablecoin"]["address"]

        amountInWei = int(getTokenDecimalValue(1, recipe[position]["token"]["decimals"]))

        amountOutWei = swapToken(
            tokenToSwapFrom=fromAddress,
            tokenToSwapTo=toAddress,
            amountInWei=amountInWei,
            amountOutMinWei=amountOutWei,
            swappingToGas=False,
            rpcURL=recipe[position]["chain"]["rpc"],
            explorerUrl=recipe[position]["chain"]["blockExplorer"],
            routerAddress=recipe[position]["chain"]["uniswapRouter"],
        )

        priceDict[position] = float(getTokenNormalValue(amountOutWei, recipe[position]["stablecoin"]["decimals"]))

        x = 1

    return priceDict["chainOne"], priceDict["chainTwo"]

def getAmountIn(amount_in, path, private_key, rpc_address, factoryAddress, routerAddress):
    w3 = Web3(Web3.HTTPProvider(rpc_address))
    account = w3.eth.account.privateKeyToAccount(private_key)
    w3.eth.default_account = account.address

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

    return result

def getAmountOut(amount_in, path, private_key, rpc_address, factoryAddress, routerAddress):
    w3 = Web3(Web3.HTTPProvider(rpc_address))
    account = w3.eth.account.privateKeyToAccount(private_key)
    w3.eth.default_account = account.address

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
