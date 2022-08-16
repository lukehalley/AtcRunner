import os
from decimal import Decimal

from retry import retry

from src.apis.synapseBridge.synapseBridge_Utils import callSynapseTokenCaseRetry, buildSynapseAPIBaseURL
from src.utils.web.web_Requests import buildApiURL
from src.utils.files.files_Directory import getProjectLogger, getRetryParams
from src.utils.wei import getTokenNormalValue, getTokenDecimalValue

logger = getProjectLogger()

synapseAPIBaseURL = buildSynapseAPIBaseURL()

httpRetryLimit, httpRetryDelay = getRetryParams(retryType="http")

# Estimate the output of a bridge
@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def estimateBridgeOutput(fromChain: int, toChain: int, fromToken: str, toToken: str, amountToBridge: int, decimalPlacesFrom: int, decimalPlacesTo: int, returning=False):
    if returning:
        x = decimalPlacesFrom
        decimalPlacesFrom = decimalPlacesTo
        decimalPlacesTo = x
    amountFromDecimal = getTokenDecimalValue(amountToBridge, decimalPlacesTo)
    params = {"fromChain": int(fromChain), "toChain": int(toChain), "fromToken": fromToken, "toToken": toToken,
              "amountFrom": amountFromDecimal}

    endpoint = buildApiURL(baseUrl=synapseAPIBaseURL, endpoint=os.getenv("SYNAPSE_ESTIMATE_BRIDGE_OUTPUT_ENDPOINT"))

    result = callSynapseTokenCaseRetry(endpoint=endpoint, params=params)

    amountToReceive = Decimal(getTokenNormalValue(result["amountToReceive"], decimalPlacesFrom))
    return amountToReceive

# Estimate the output of a swap
@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def estimateSwapOutput(chain: int, fromToken: str, toToken: str, amountIn: int):
    params = {"chain": chain, "fromToken": fromToken, "toToken": toToken, "amountIn": amountIn}
    endpoint = buildApiURL(baseUrl=synapseAPIBaseURL, endpoint=os.getenv("SYNAPSE_ESTIMATE_SWAP_OUTPUT_ENDPOINT"))

    return callSynapseTokenCaseRetry(endpoint=endpoint, params=params)
