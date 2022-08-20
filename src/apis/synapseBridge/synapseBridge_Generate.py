import os

from retry import retry

from src.apis.synapseBridge.synapseBridge_Utils import buildSynapseAPIBaseURL, callSynapseTokenCaseRetry
from src.utils.logging.logging_Setup import getProjectLogger
from src.utils.retry.retry_Params import getRetryParams
from src.utils.web.web_URLs import buildApiURL

logger = getProjectLogger()

synapseAPIBaseURL = buildSynapseAPIBaseURL()

httpRetryLimit, httpRetryDelay = getRetryParams(retryType="http")


# Generate a skeleton swap transaction
@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def generateSwapTransaction(chain: int, fromToken: str, toToken: str, amountIn: int):
    params = {"chain": chain, "fromToken": fromToken, "toToken": toToken, "amountIn": amountIn}
    endpoint = buildApiURL(baseUrl=synapseAPIBaseURL, endpoint=os.getenv("SYNAPSE_GENERATE_SWAP_TRANSACTION_ENDPOINT"))

    return callSynapseTokenCaseRetry(endpoint=endpoint, params=params)


# Generate a skeleton approval bridge transaction
@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def generateUnsignedBridgeApprovalTransaction(fromChain: int, fromToken: str):
    params = {"fromChain": fromChain, "fromToken": fromToken}
    endpoint = buildApiURL(baseUrl=synapseAPIBaseURL,
                           endpoint=os.getenv("SYNAPSE_GENERATE_UNSIGNED_BRIDGE_APPROVAL_TRANSACTION_ENDPOINT"))

    return callSynapseTokenCaseRetry(endpoint=endpoint, params=params)


# Generate a skeleton bridge transaction
@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def generateUnsignedBridgeTransaction(fromChain: int, toChain: int, fromToken: str, toToken: str, amountFrom: int,
                                      addressTo: str):
    params = {"fromChain": fromChain, "toChain": toChain, "fromToken": fromToken, "toToken": toToken,
              "amountFrom": amountFrom, "addressTo": addressTo}
    endpoint = buildApiURL(baseUrl=synapseAPIBaseURL,
                           endpoint=os.getenv("SYNAPSE_GENERATE_UNSIGNED_BRIDGE_TRANSACTION_ENDPOINT"))

    return callSynapseTokenCaseRetry(endpoint=endpoint, params=params)
