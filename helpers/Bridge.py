import os

import requests
from dotenv import load_dotenv
from helpers import Utils
import logging
from web3 import Web3
logger = logging.getLogger("DFK-DEX")

load_dotenv()

synapseAPIEndpoint = os.getenv("SYNAPSE_API_ENDPOINT")
synapseAPIVersion = os.getenv("SYNAPSE_API_VERSION")
synapseAPIBaseURL = synapseAPIEndpoint + "/" + synapseAPIVersion

def getTokenDecimalValue(amount, decimalPlaces=18):
    initValue = float(amount) * (10**decimalPlaces)
    readable = str(format(initValue, '.0f'))
    return readable

def getTokenNormalValue(amount, decimalPlaces=18):
    initValue = float(amount) / (10 ** decimalPlaces)
    return str(initValue)

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

def estimateBridgeOutput(fromChain, toChain, fromToken, toToken, amountFrom, decimalPlaces=18):
    amountFrom = getTokenDecimalValue(amountFrom)
    params = {"fromChain": fromChain, "toChain": toChain, "fromToken": fromToken, "toToken": toToken, "amountFrom": amountFrom}
    endpoint = buildApiURL(os.getenv("SYNAPSE_ESTIMATE_BRIDGE_OUTPUT_ENDPOINT"))
    result = (requests.get(endpoint, params=params)).json()
    amountToReceive = float(getTokenNormalValue(result["amountToReceive"]))
    bridgeFee = float(getTokenNormalValue(result["bridgeFee"]))
    bridgeQuote = {'amountToReceive': amountToReceive, 'bridgeFee': bridgeFee}
    return bridgeQuote

def estimateSwapOutput(chain, fromToken, toToken, amountIn, decimalPlaces=18):
    amountIn = getTokenDecimalValue(amountIn)
    params = {"chain": chain, "fromToken": fromToken, "toToken": toToken, "amountIn": amountIn}
    endpoint = buildApiURL(os.getenv("SYNAPSE_ESTIMATE_SWAP_OUTPUT_ENDPOINT"))

    return (requests.get(endpoint, params=params)).json()

def generateSwapTransaction(chain, fromToken, toToken, amountIn):
    params = {"chain": chain, "fromToken": fromToken, "toToken": toToken, "amountIn": amountIn}
    endpoint = buildApiURL(os.getenv("SYNAPSE_GENERATE_SWAP_TRANSACTION_ENDPOINT"))

    return (requests.get(endpoint, params=params)).json()

def generateUnsignedBridgeApprovalTransaction(fromChain, fromToken):
    params = {"fromChain": fromChain, "fromToken": fromToken}
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

def calculateSynapseBridgeFees(arbitrageOrigin, arbitrageDestination, amountToBridge):

    i = 0

    arbitragePlan = {}

    networks = [arbitrageOrigin, arbitrageDestination]

    while i < 2:

        if i <= 0:
            currentArbitrageOrigin = networks[0]
            currentArbitrageDestination = networks[1]
            Utils.printSeperator()
            logger.info(f"[ARB #{arbitrageOrigin['roundTripCount']}] Calculating Bridge Fees For Arbitrage Origin to Arbitrage Destination")
            Utils.printSeperator()
        else:
            currentArbitrageOrigin = networks[1]
            currentArbitrageDestination = networks[0]
            Utils.printSeperator()
            logger.info(f"[ARB #{arbitrageOrigin['roundTripCount']}] Calculating Bridge Fees For Arbitrage Destination to Arbitrage Origin")
            Utils.printSeperator()

        bridgeQuote = estimateBridgeOutput(currentArbitrageOrigin["networkDetails"]["chainID"], currentArbitrageDestination["networkDetails"]["chainID"], currentArbitrageOrigin["token"]["address"], currentArbitrageDestination["token"]["address"], amountToBridge)
        amountToReceive = bridgeQuote["amountToReceive"]
        bridgeFee = bridgeQuote["bridgeFee"]
        bridgeToken = networks[1]['bridgeToken']

        logger.info(f"After bridge we will receive {amountToReceive} {bridgeToken}")

        if i <= 0:
            objectTitle = "arbitrageOrigin"
            arbitragePlan[objectTitle] = \
                {
                    "network": arbitrageOrigin,
                    "amountSent": amountToBridge,
                    "bridgeFee": bridgeFee,
                    "bridgeToken": bridgeToken
                }
        else:
            objectTitle = "arbitrageDestination"
            arbitragePlan[objectTitle] = \
                {
                    "network": arbitrageDestination,
                    "amountExpectedToReceive": amountToReceive,
                    "bridgeFee": bridgeFee,
                    "bridgeToken": bridgeToken
                }

        i = i + 1

        Utils.printSeperator(True)

    Utils.printSeperator()
    logger.info(f"[ARB #{arbitrageOrigin['roundTripCount']}] Bridge Fees Calculated")
    Utils.printSeperator()

    feeAmount = arbitragePlan["arbitrageOrigin"]["bridgeFee"] + arbitragePlan["arbitrageDestination"]["bridgeFee"]
    tokenLoss = abs(arbitragePlan["arbitrageDestination"]["amountExpectedToReceive"] - arbitragePlan["arbitrageOrigin"]["amountSent"])

    arbitragePlan["bridgeTotals"] = {
        "bridgeToken": arbitragePlan['arbitrageOrigin']['bridgeToken'],
        "bridgeTotalTokenLoss": tokenLoss,
        "bridgeTotalFee": round(feeAmount, 6)
    }

    logger.info(f"Bridge Total Fee: {arbitragePlan['bridgeTotals']['bridgeTotalFee']} {arbitragePlan['bridgeTotals']['bridgeToken']}")

    return arbitragePlan

def executeBridge(arbitragePlan, amountToBridge):

    origin = arbitragePlan[arbitragePlan["currentBridgeDirection"]]
    destination = arbitragePlan[arbitragePlan["oppositeBridgeDirection"]]

    rpcURL = origin["network"]["networkDetails"]["chainRPC"]

    fromChain = origin["network"]["networkDetails"]["chainID"]
    toChain = destination["network"]["networkDetails"]["chainID"]

    fromToken = origin["bridgeToken"]
    toToken = destination["bridgeToken"]

    amountFrom = amountToBridge

    addressFrom = destination["walletAddress"]
    addressTo = destination["walletAddress"]

    bridgeTransaction = generateUnsignedBridgeTransaction(fromChain, toChain, fromToken, toToken, amountFrom, addressTo)

    w3 = Web3(Web3.HTTPProvider(rpcURL))

    tx = {
        'nonce': w3.eth.getTransactionCount(addressFrom),
        'from': addressFrom,
        'to': addressTo,
        'value': w3.toWei(amountFrom, 'ether'),
        'gas': 21000,
        'gasPrice': w3.eth.gas_price,
        'data': bridgeTransaction["unsigned_data"],
        "chainId": int(fromChain)
    }

    transactionID = "0x97a0132993a148ed7b2c3a8e8d651f28e41cf7245c6fd728158b1262a376cb1b"

    arbitragePlan[arbitragePlan["currentBridgeDirection"]]["bridgeResult"] = {
                "AmountSent": arbitragePlan[arbitragePlan["currentBridgeDirection"]]["amountSent"],
                "Successful": True,
                "TransactionType": "Bridge",
                "ID": transactionID,
                "TransactionObject": tx,
                "Timestamp": Utils.getCurrentDateTime()
            }

    return arbitragePlan