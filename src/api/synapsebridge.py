import logging
import os
import sys
from decimal import Decimal

from retry import retry

from src.utils.api import buildApiURL, safeRequest
from src.utils.general import percentage, isBetween
from src.utils.wei import getTokenNormalValue, getTokenDecimalValue

# Setup logging
logger = logging.getLogger("DFK-DEX")

# Build the base of our API endpoint url
synapseAPIEndpoint = os.getenv("SYNAPSE_API_ENDPOINT")
synapseAPIVersion = os.getenv("SYNAPSE_API_VERSION")
synapseAPIBaseURL = synapseAPIEndpoint + "/" + synapseAPIVersion

# Get the setting envs for the retry events
httpRetryLimit = int(os.environ.get("HTTP_RETRY_LIMIT"))
httpRetryDelay = int(os.environ.get("HTTP_RETRY_DELAY"))

# Check what is the status of our bridge transaction using the API
@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def checkBridgeStatusAPI(toChain, fromChainTxnHash):
    params = {'toChain': toChain, 'fromChainTxnHash': fromChainTxnHash}
    endpoint = buildApiURL(baseUrl=synapseAPIBaseURL, endpoint=os.getenv("SYNAPSE_CHECK_BRIDGE_STATUS_ENDPOINT"))
    return safeRequest(endpoint=endpoint, params=params)

# Check what is the status of our bridge transaction using the API
@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def checkBridgeStatusBalance(predictions, stepNumber, toChainRPCURL, toTokenAddress, toTokenDecimals):
    from src.wallet.queries.network import getTokenBalance
    if predictions["steps"][stepNumber]["stepType"] == "bridge":
        bridgePredictions = predictions["steps"][stepNumber]["amountOut"]

        percentageDifference = percentage(percent=10, whole=predictions["steps"][2]["amountOut"])
        lowerLimit = bridgePredictions - percentageDifference
        upperLimit = bridgePredictions + percentageDifference

        currentBalance = getTokenBalance(rpcURL=toChainRPCURL, tokenAddress=toTokenAddress,
                                         tokenDecimals=toTokenDecimals)

        return isBetween(lowerLimit=lowerLimit, middleNumber=currentBalance, upperLimit=upperLimit)
    else:
        sys.exit("Prediction not a bridge type!")

# Check if a swap is supported
@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def checkSwapSupported(fromChain, toChain, fromToken, toToken):
    params = {"fromChain": fromChain, "toChain": toChain, "fromToken": fromToken, "toToken": toToken}
    endpoint = buildApiURL(baseUrl=synapseAPIBaseURL, endpoint=os.getenv("SYNAPSE_CHECK_SWAP_SUPPORTED_ENDPOINT"))

    return safeRequest(endpoint=endpoint, params=params)

# Estimate the output of a bridge
@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def estimateBridgeOutput(fromChain, toChain, fromToken, toToken, amountToBridge, decimalPlacesFrom, decimalPlacesTo, returning=False):
    if returning:
        x = decimalPlacesFrom
        decimalPlacesFrom = decimalPlacesTo
        decimalPlacesTo = x
    amountFromDecimal = getTokenDecimalValue(amountToBridge, decimalPlacesTo)
    params = {"fromChain": int(fromChain), "toChain": int(toChain), "fromToken": fromToken, "toToken": toToken,
              "amountFrom": amountFromDecimal}

    endpoint = buildApiURL(baseUrl=synapseAPIBaseURL, endpoint=os.getenv("SYNAPSE_ESTIMATE_BRIDGE_OUTPUT_ENDPOINT"))
    result = safeRequest(endpoint=endpoint, params=params)
    amountToReceive = Decimal(getTokenNormalValue(result["amountToReceive"], decimalPlacesFrom))
    return amountToReceive

# Estimate the output of a swap
@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def estimateSwapOutput(chain, fromToken, toToken, amountIn):
    params = {"chain": chain, "fromToken": fromToken, "toToken": toToken, "amountIn": amountIn}
    endpoint = buildApiURL(baseUrl=synapseAPIBaseURL, endpoint=os.getenv("SYNAPSE_ESTIMATE_SWAP_OUTPUT_ENDPOINT"))

    return safeRequest(endpoint=endpoint, params=params)

# Generate a skeleton swap transaction
@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def generateSwapTransaction(chain, fromToken, toToken, amountIn):
    params = {"chain": chain, "fromToken": fromToken, "toToken": toToken, "amountIn": amountIn}
    endpoint = buildApiURL(baseUrl=synapseAPIBaseURL, endpoint=os.getenv("SYNAPSE_GENERATE_SWAP_TRANSACTION_ENDPOINT"))

    return safeRequest(endpoint=endpoint, params=params)

# Generate a skeleton approval bridge transaction
@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def generateUnsignedBridgeApprovalTransaction(fromChain, fromToken):
    params = {"fromChain": fromChain, "fromToken": fromToken}
    endpoint = buildApiURL(baseUrl=synapseAPIBaseURL, endpoint=os.getenv("SYNAPSE_GENERATE_UNSIGNED_BRIDGE_APPROVAL_TRANSACTION_ENDPOINT"))

    return safeRequest(endpoint=endpoint, params=params)

# Generate a skeleton bridge transaction
@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def generateUnsignedBridgeTransaction(fromChain, toChain, fromToken, toToken, amountFrom, addressTo):
    params = {"fromChain": fromChain, "toChain": toChain, "fromToken": fromToken, "toToken": toToken,
              "amountFrom": amountFrom, "addressTo": addressTo}
    endpoint = buildApiURL(baseUrl=synapseAPIBaseURL, endpoint=os.getenv("SYNAPSE_GENERATE_UNSIGNED_BRIDGE_TRANSACTION_ENDPOINT"))

    return safeRequest(endpoint=endpoint, params=params)

# Get bridgeable tokens for a given chain
@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def getBridgeableTokens(chain):
    params = {"chain": chain}
    endpoint = buildApiURL(baseUrl=synapseAPIBaseURL, endpoint=os.getenv("SYNAPSE_GET_BRIDGEABLE_TOKENS_ENDPOINT"))

    return safeRequest(endpoint=endpoint, params=params)

# Get all the chains a token is on
@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def getChainsForToken(token):
    params = {"token": token}
    endpoint = buildApiURL(baseUrl=synapseAPIBaseURL, endpoint=os.getenv("SYNAPSE_GET_CHAINS_FOR_TOKEN_ENDPOINT"))

    return safeRequest(endpoint=endpoint, params=params)

# Get the current stableswap pools
@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def getStableswapPools(chain):
    params = {"chain": chain}
    endpoint = buildApiURL(baseUrl=synapseAPIBaseURL, endpoint=os.getenv("SYNAPSE_GET_STABLESWAP_POOLS_ENDPOINT"))

    return safeRequest(endpoint=endpoint, params=params)

# Get all swappable tokens for a given network
@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def getSwappableTokensForNetwork(chainFrom, toChain):
    params = {"chainFrom": chainFrom, "toChain": toChain}
    endpoint = buildApiURL(baseUrl=synapseAPIBaseURL, endpoint=os.getenv("SYNAPSE_GET_SWAPPABLE_TOKENS_FOR_NETWORK_ENDPOINT"))

    return safeRequest(endpoint=endpoint, params=params)

