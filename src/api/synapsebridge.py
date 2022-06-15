import os, requests, logging
from retry import retry

from src.utils.api import buildApiURL
from src.utils.chain import getTokenDecimalValue, getTokenNormalValue

# Setup logging
logger = logging.getLogger("DFK-DEX")

# Build the base of our API endpoint url
synapseAPIEndpoint = os.getenv("SYNAPSE_API_ENDPOINT")
synapseAPIVersion = os.getenv("SYNAPSE_API_VERSION")
synapseAPIBaseURL = synapseAPIEndpoint + "/" + synapseAPIVersion

# Get the setting envs for the retry events
transactionRetryLimit = int(os.environ.get("TRANSACTION_RETRY_LIMIT"))
transactionRetryDelay = int(os.environ.get("TRANSACTION_RETRY_DELAY"))

# Check what is the status of our bridge transaction
# @retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def checkBridgeStatus(toChain, fromChainTxnHash):
    params = {'toChain': toChain, 'fromChainTxnHash': fromChainTxnHash}
    endpoint = buildApiURL(baseUrl=synapseAPIBaseURL, endpoint=os.getenv("SYNAPSE_CHECK_BRIDGE_STATUS_ENDPOINT"))
    return (requests.get(endpoint, params=params)).json()

# Check if a swap is supported
# @retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def checkSwapSupported(fromChain, toChain, fromToken, toToken):
    params = {"fromChain": fromChain, "toChain": toChain, "fromToken": fromToken, "toToken": toToken}
    endpoint = buildApiURL(baseUrl=synapseAPIBaseURL, endpoint=os.getenv("SYNAPSE_CHECK_SWAP_SUPPORTED_ENDPOINT"))

    return (requests.get(endpoint, params=params)).json()

# Estimate the output of a bridge
# @retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def estimateBridgeOutput(fromChain, toChain, fromToken, toToken, amountToBridge, decimalPlacesFrom, decimalPlacesTo, returning=False):
    if returning:
        x = decimalPlacesFrom
        decimalPlacesFrom = decimalPlacesTo
        decimalPlacesTo = x

    amountFromDecimal = getTokenDecimalValue(amountToBridge, decimalPlacesTo)
    params = {"fromChain": fromChain, "toChain": toChain, "fromToken": fromToken, "toToken": toToken,
              "amountFrom": amountFromDecimal}
    endpoint = buildApiURL(baseUrl=synapseAPIBaseURL, endpoint=os.getenv("SYNAPSE_ESTIMATE_BRIDGE_OUTPUT_ENDPOINT"))
    result = (requests.get(endpoint, params=params)).json()
    amountToReceive = float(getTokenNormalValue(result["amountToReceive"], decimalPlacesFrom))
    return amountToReceive

# Estimate the output of a swap
# @retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def estimateSwapOutput(chain, fromToken, toToken, amountIn):
    params = {"chain": chain, "fromToken": fromToken, "toToken": toToken, "amountIn": amountIn}
    endpoint = buildApiURL(baseUrl=synapseAPIBaseURL, endpoint=os.getenv("SYNAPSE_ESTIMATE_SWAP_OUTPUT_ENDPOINT"))

    return (requests.get(endpoint, params=params)).json()

# Generate a skeleton swap transaction
# @retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def generateSwapTransaction(chain, fromToken, toToken, amountIn):
    params = {"chain": chain, "fromToken": fromToken, "toToken": toToken, "amountIn": amountIn}
    endpoint = buildApiURL(baseUrl=synapseAPIBaseURL, endpoint=os.getenv("SYNAPSE_GENERATE_SWAP_TRANSACTION_ENDPOINT"))

    return (requests.get(endpoint, params=params)).json()

# Generate a skeleton approval bridge transaction
# @retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def generateUnsignedBridgeApprovalTransaction(fromChain, fromToken):
    params = {"fromChain": fromChain, "fromToken": fromToken}
    endpoint = buildApiURL(baseUrl=synapseAPIBaseURL, endpoint=os.getenv("SYNAPSE_GENERATE_UNSIGNED_BRIDGE_APPROVAL_TRANSACTION_ENDPOINT"))

    return (requests.get(endpoint, params=params)).json()

# Generate a skeleton bridge transaction
# @retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def generateUnsignedBridgeTransaction(fromChain, toChain, fromToken, toToken, amountFrom, addressTo):
    params = {"fromChain": fromChain, "toChain": toChain, "fromToken": fromToken, "toToken": toToken,
              "amountFrom": amountFrom, "addressTo": addressTo}
    endpoint = buildApiURL(baseUrl=synapseAPIBaseURL, endpoint=os.getenv("SYNAPSE_GENERATE_UNSIGNED_BRIDGE_TRANSACTION_ENDPOINT"))

    return (requests.get(endpoint, params=params)).json()

# Get bridgeable tokens for a given chain
# @retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getBridgeableTokens(chain):
    params = {"chain": chain}
    endpoint = buildApiURL(baseUrl=synapseAPIBaseURL, endpoint=os.getenv("SYNAPSE_GET_BRIDGEABLE_TOKENS_ENDPOINT"))

    return (requests.get(endpoint, params=params)).json()

# Get all the chains a token is on
# @retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getChainsForToken(token):
    params = {"token": token}
    endpoint = buildApiURL(baseUrl=synapseAPIBaseURL, endpoint=os.getenv("SYNAPSE_GET_CHAINS_FOR_TOKEN_ENDPOINT"))

    return (requests.get(endpoint, params=params)).json()

# Get the current stableswap pools
# @retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getStableswapPools(chain):
    params = {"chain": chain}
    endpoint = buildApiURL(baseUrl=synapseAPIBaseURL, endpoint=os.getenv("SYNAPSE_GET_STABLESWAP_POOLS_ENDPOINT"))

    return (requests.get(endpoint, params=params)).json()

# Get all swappable tokens for a given network
# @retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getSwappableTokensForNetwork(chainFrom, toChain):
    params = {"chainFrom": chainFrom, "toChain": toChain}
    endpoint = buildApiURL(baseUrl=synapseAPIBaseURL, endpoint=os.getenv("SYNAPSE_GET_SWAPPABLE_TOKENS_FOR_NETWORK_ENDPOINT"))

    return (requests.get(endpoint, params=params)).json()

