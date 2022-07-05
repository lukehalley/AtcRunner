import logging, os

from retry import retry
from web3 import Web3

from src.api.synapsebridge import getTokenDecimalValue, getTokenNormalValue
from src.dex.uniswap_v2_router import get_amounts_out, get_amounts_in

# Set up our logging
logger = logging.getLogger("DFK-DEX")

transactionRetryLimit = int(os.environ.get("TRANSACTION_RETRY_LIMIT"))
transactionRetryDelay = int(os.environ.get("TRANSACTION_RETRY_DELAY"))

def normaliseSwapRoutes(routes):
    normalisedRoutes = []

    for route in routes:
        normalisedAddress = Web3.toChecksumAddress(route)

        if normalisedAddress not in normalisedRoutes:
            normalisedRoutes.append(Web3.toChecksumAddress(route))

    return normalisedRoutes


# @retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getSwapQuoteOut(amountInNormal, amountInDecimals, amountOutDecimals, routes,  rpcUrl, routerAddress):

    normalisedRoutes = normaliseSwapRoutes(routes)

    amountInWei = int(getTokenDecimalValue(amountInNormal, amountInDecimals))

    out = get_amounts_out(
        amount_in=amountInWei,
        addresses=normalisedRoutes,
        rpc_address=rpcUrl,
        routerAddress=routerAddress
    )

    amountOutWei = out[-1]

    quote = getTokenNormalValue(amountOutWei, amountOutDecimals)

    return quote

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getSwapQuoteIn(amountOutNormal, amountOutDecimals, amountInDecimals, routes,  rpcUrl, routerAddress):

    normalisedRoutes = normaliseSwapRoutes(routes)

    amountWei = int(getTokenDecimalValue(amountOutNormal, amountOutDecimals))

    out = get_amounts_in(
        amount_out=amountWei,
        addresses=normalisedRoutes,
        rpc_address=rpcUrl,
        routerAddress=routerAddress
    )

    quote = getTokenNormalValue(out[0], amountInDecimals)

    return quote




