import os

import requests
from dotenv import load_dotenv
load_dotenv()

synapseAPIEndpoint = os.getenv("SYNAPSE_API_ENDPOINT")
synapseAPIVersion = os.getenv("SYNAPSE_API_VERSION")
synapseAPIBaseURL = synapseAPIEndpoint + "/" + synapseAPIVersion


def buildApiURL(endpoint):
    return f"{synapseAPIBaseURL}/{endpoint}"

def checkBridgeStatus(toChain, fromChainTxnHash):
    params = {'toChain': toChain, 'fromChainTxnHash': fromChainTxnHash}
    endpoint = buildApiURL(os.getenv("SYNAPSE_CHECK_BRIDGE_STATUS_ENDPOINT"))

    return (requests.get(endpoint, params=params)).json()

def checkSwapSupported(fromChain, toChain, fromToken, toToken):
    params = {"fromChain": fromChain, "toChain": toChain, "fromToken": fromToken, "toToken": toToken}
    endpoint = buildApiURL(os.getenv("SYNAPSE_CHECK_SWAP_SUPPORTED_ENDPOINT"))

    return (requests.get(endpoint, params=params)).json()

def estimateBridgeOutput(fromChain, toChain, fromToken, toToken, amountFrom):
    params = {"fromChain": fromChain, "toChain": toChain, "fromToken": fromToken, "toToken": toToken, "amountFrom": amountFrom}
    endpoint = buildApiURL(os.getenv("SYNAPSE_ESTIMATE_BRIDGE_OUTPUT_ENDPOINT"))

    return (requests.get(endpoint, params=params)).json()

def estimateSwapOutput(chain, fromToken, toToken, amountIn):
    params = {"chain": chain, "fromToken": fromToken, "toToken": toToken, "amountIn": amountIn}
    endpoint = buildApiURL(os.getenv("SYNAPSE_ESTIMATE_SWAP_OUTPUT_ENDPOINT"))

    return (requests.get(endpoint, params=params)).json()

def generateSwapTransaction(chain, fromToken, toToken, amountIn):
    params = {"chain": chain, "fromToken": fromToken, "toToken": toToken, "amountIn": amountIn}
    endpoint = buildApiURL(os.getenv("SYNAPSE_GENERATE_SWAP_TRANSACTION_ENDPOINT"))

    return (requests.get(endpoint, params=params)).json()

def generateUnsignedBridgeApprovalTransaction(fromChainm, fromToken):
    params = {"fromChainm": fromChainm, "fromToken": fromToken}
    endpoint = buildApiURL(os.getenv("SYNAPSE_GENERATE_UNSIGNED_BRIDGE_APPROVAL_TRANSACTION_ENDPOINT"))

    return (requests.get(endpoint, params=params)).json()

def generateUnsignedBridgeTransaction(fromChain, toChain, fromToken, toToken, amountFrom, addressTo):
    params = {"fromChain": fromChain, "toChain": toChain, "fromToken": fromToken, "toToken": toToken, "amountFrom": amountFrom, "addressTo": addressTo}
    endpoint = buildApiURL(os.getenv("SYNAPSE_GENERATE_UNSIGNED_BRIDGE_TRANSACTION_ENDPOINT"))

    return (requests.get(endpoint, params=params)).json()

def getBridgeableTokens(chain):
    params = {"chain": chain}
    endpoint = buildApiURL(os.getenv("SYNAPSE_GET_BRIDGEABLE_TOKENS_ENDPOINT"))

    return (requests.get(endpoint, params=params)).json()

def getChainsForToken(token):
    params = {"token": token}
    endpoint = buildApiURL(os.getenv("SYNAPSE_GET_CHAINS_FOR_TOKEN_ENDPOINT"))

    return (requests.get(endpoint, params=params)).json()

def getStableswapPools(chain):
    params = {"chain": chain}
    endpoint = buildApiURL(os.getenv("SYNAPSE_GET_STABLESWAP_POOLS_ENDPOINT"))

    return (requests.get(endpoint, params=params)).json()

def getSwappableTokensForNetwork(chainFrom, toChain):
    params = {"chainFrom": chainFrom, "toChain": toChain}
    endpoint = buildApiURL(os.getenv("SYNAPSE_GET_SWAPPABLE_TOKENS_FOR_NETWORK_ENDPOINT"))

    return (requests.get(endpoint, params=params)).json()

# result = checkBridgeStatus(toChain="43114", fromChainTxnHash="0x97a0132993a148ed7b2c3a8e8d651f28e41cf7245c6fd728158b1262a376cb1b")

x = 1
