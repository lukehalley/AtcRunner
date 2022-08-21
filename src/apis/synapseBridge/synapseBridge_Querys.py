import os

from retry import retry

from src.apis.synapseBridge.synapseBridge_Utils import buildSynapseAPIBaseURL, callSynapseTokenCaseRetry
from src.chain.network.network_Querys import getTokenBalance
from src.utils.logging.logging_Setup import getProjectLogger
from src.utils.math.math_Logic import isBetween
from src.utils.math.math_Percentage import getPercentageOfNumber
from src.utils.retry.retry_Params import getRetryParams
from src.utils.web.web_Requests import safeRequest
from src.utils.web.web_URLs import buildApiURL

logger = getProjectLogger()

synapseAPIBaseURL = buildSynapseAPIBaseURL()

httpRetryLimit, httpRetryDelay = getRetryParams(retryType="http")


# Check what is the status of our bridge transaction using the API
@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def queryBridgeStatusAPI(toChain: int, fromChainTxnHash: str):
    params = {'toChain': toChain, 'fromChainTxnHash': fromChainTxnHash}
    endpoint = buildApiURL(baseUrl=synapseAPIBaseURL, endpoint=os.getenv("SYNAPSE_CHECK_BRIDGE_STATUS_ENDPOINT"))
    return safeRequest(endpoint=endpoint, params=params)


# Check what is the status of our bridge transaction using the chain balance
@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def queryBridgeStatusBalance(predictions: dict, stepNumber: int, toChainRPCURL: str, toTokenAddress: int,
                             toTokenDecimals: int, wethContractABI: dict):
    if predictions["steps"][stepNumber]["stepType"] == "bridge":
        bridgePredictions = predictions["steps"][stepNumber]["amountOut"]

        percentageDifference = getPercentageOfNumber(percent=10, whole=predictions["steps"][2]["amountOut"])
        lowerLimit = bridgePredictions - percentageDifference
        upperLimit = bridgePredictions + percentageDifference

        currentBalance = getTokenBalance(fromChainRPCUrl=toChainRPCURL, tokenAddress=toTokenAddress,
                                         tokenDecimals=toTokenDecimals, wethContractABI=wethContractABI)

        return isBetween(lowerLimit=lowerLimit, middleNumber=currentBalance, upperLimit=upperLimit)
    else:
        raise Exception("Prediction not a bridge type!")


# Check if a swap is supported
@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def querySwapSupported(fromChain: int, toChain: int, fromToken: str, toToken: str):
    params = {"fromChain": fromChain, "toChain": toChain, "fromToken": fromToken, "toToken": toToken}
    endpoint = buildApiURL(baseUrl=synapseAPIBaseURL, endpoint=os.getenv("SYNAPSE_CHECK_SWAP_SUPPORTED_ENDPOINT"))

    return callSynapseTokenCaseRetry(endpoint=endpoint, params=params)


# Get bridgeable tokens for a given chain
@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def queryBridgeableTokens(chain: int):
    params = {"chain": chain}
    endpoint = buildApiURL(baseUrl=synapseAPIBaseURL, endpoint=os.getenv("SYNAPSE_GET_BRIDGEABLE_TOKENS_ENDPOINT"))

    return safeRequest(endpoint=endpoint, params=params)


# Get all the chains a tokens is on
@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def queryChainsForToken(token: str):
    params = {"token": token}
    endpoint = buildApiURL(baseUrl=synapseAPIBaseURL, endpoint=os.getenv("SYNAPSE_GET_CHAINS_FOR_TOKEN_ENDPOINT"))

    return safeRequest(endpoint=endpoint, params=params)


# Get the current stableswap pools
@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def queryStableswapPools(chain: int):
    params = {"chain": chain}
    endpoint = buildApiURL(baseUrl=synapseAPIBaseURL, endpoint=os.getenv("SYNAPSE_GET_STABLESWAP_POOLS_ENDPOINT"))

    return safeRequest(endpoint=endpoint, params=params)


# Get all swappable tokens for a given network
@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def querySwappableTokensForNetwork(chainFrom: int, toChain: int):
    params = {"chainFrom": chainFrom, "toChain": toChain}
    endpoint = buildApiURL(baseUrl=synapseAPIBaseURL,
                           endpoint=os.getenv("SYNAPSE_GET_SWAPPABLE_TOKENS_FOR_NETWORK_ENDPOINT"))

    return safeRequest(endpoint=endpoint, params=params)
