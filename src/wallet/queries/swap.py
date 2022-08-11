import logging
import os

from retry import retry
from web3 import Web3

from src.api.synapsebridge import getTokenDecimalValue, getTokenNormalValue
from src.wallet.contracts.uniswap_v2_router import getAmountsOut, getAmountsIn

# Set up our logging
logger = logging.getLogger("DFK-DEX")

transactionRetryLimit = int(os.environ.get("TRANSACTION_QUERY_RETRY_LIMIT"))
transactionRetryDelay = int(os.environ.get("TRANSACTION_QUERY_RETRY_DELAY"))

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def normaliseSwapRoutes(routes):
    normalisedRoutes = []

    for route in routes:
        normalisedAddress = Web3.toChecksumAddress(route)

        if normalisedAddress not in normalisedRoutes:
            normalisedRoutes.append(Web3.toChecksumAddress(route))

    return normalisedRoutes

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getSwapQuoteOut(amountInNormal, amountInDecimals, amountOutDecimals, routes,  rpcUrl, routerAddress, routerABI, routerABIMappings):

    normalisedRoutes = normaliseSwapRoutes(routes)

    amountInWei = int(getTokenDecimalValue(amountInNormal, amountInDecimals))

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

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getSwapQuoteIn(amountOutNormal, amountOutDecimals, amountInDecimals, routes,  rpcUrl, routerAddress, routerABI):

    normalisedRoutes = normaliseSwapRoutes(routes)

    amountWei = int(getTokenDecimalValue(amountOutNormal, amountOutDecimals))

    out = getAmountsIn(
        amount_out=amountWei,
        addresses=normalisedRoutes,
        rpc_address=rpcUrl,
        routerAddress=routerAddress,
        routerABI=routerABI
    )

    quote = getTokenNormalValue(out[0], amountInDecimals)

    return quote




