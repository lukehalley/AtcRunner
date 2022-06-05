import os
from retry import retry
import requests
from dotenv import load_dotenv
from helpers import Utils, Wallet
import logging
from web3 import Web3

logger = logging.getLogger("DFK-DEX")

load_dotenv()

synapseAPIEndpoint = os.getenv("SYNAPSE_API_ENDPOINT")
synapseAPIVersion = os.getenv("SYNAPSE_API_VERSION")
synapseAPIBaseURL = synapseAPIEndpoint + "/" + synapseAPIVersion

# Retry Envs
transactionRetryLimit = int(os.environ.get("TRANSACTION_RETRY_LIMIT"))
transactionRetryDelay = int(os.environ.get("TRANSACTION_RETRY_DELAY"))

from helpers import Data

def getTokenDecimalValue(amount, decimalPlaces=18):
    return str(format(float(amount) * (10**decimalPlaces), f'.0f'))

def getTokenNormalValue(amount, decimalPlaces=18):
    return str(format(float(amount) / (10**decimalPlaces), f'.{decimalPlaces}f'))

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

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def estimateBridgeOutput(fromChain, toChain, fromToken, toToken, amountToBridge, decimalPlacesFrom, decimalPlacesTo, returning=False):

    if returning:
        x = decimalPlacesFrom
        decimalPlacesFrom = decimalPlacesTo
        decimalPlacesTo = x

    amountFromDecimal = getTokenDecimalValue(amountToBridge, decimalPlacesTo)
    params = {"fromChain": fromChain, "toChain": toChain, "fromToken": fromToken, "toToken": toToken, "amountFrom": amountFromDecimal}
    endpoint = buildApiURL(os.getenv("SYNAPSE_ESTIMATE_BRIDGE_OUTPUT_ENDPOINT"))
    result = (requests.get(endpoint, params=params)).json()
    amountToReceive = float(getTokenNormalValue(result["amountToReceive"], decimalPlacesFrom))
    bridgeFeeManual = amountToBridge - amountToReceive
    bridgeFee = float(getTokenNormalValue(result["bridgeFee"], 18))
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

def calculateSynapseBridgeFees(recipe):

    i = 0

    directionList = ("origin", "destination")

    for direction in directionList:

        if direction == "origin":
            tokenType = "token"
            index = 1
        else:
            tokenType = "stablecoin"
            index = 0

        currentOrigin = recipe[direction]
        oppositeDirection = directionList[index]
        currentDestination = recipe[oppositeDirection]

        Utils.printSeperator()
        logger.info(f"[ARB #{recipe['info']['currentRoundTripCount']}] "
                    f"Calculating Bridge Fees For Arbitrage {direction.title()} to "
                    f"Arbitrage {oppositeDirection.title()}")
        Utils.printSeperator()

        bridgeQuote = estimateBridgeOutput(
            fromChain=currentOrigin["chain"]["id"],
            toChain=currentDestination["chain"]["id"],
            fromToken=currentOrigin[tokenType]['symbol'],
            toToken=currentDestination[tokenType]['symbol'],
            amountToBridge=10,
            decimalPlacesFrom=currentOrigin[tokenType]["tokenDecimals"],
            decimalPlacesTo=currentDestination[tokenType]["tokenDecimals"],
            returning=(not direction == "origin"))

        amountToReceive = bridgeQuote["amountToReceive"]
        if tokenType == "token":
            bridgeFee = bridgeQuote["bridgeFee"] * currentOrigin[tokenType]["price"]
        else:
            bridgeFee = bridgeQuote["bridgeFee"]
        recipe = Data.addFee(recipe, bridgeFee, direction)

        bridgeToken = currentOrigin[tokenType]["symbol"]
        logger.info(f"After bridge we will receive {amountToReceive} {bridgeToken} with a fee of {bridgeFee} {bridgeToken}")

        Utils.printSeperator(True)

    Utils.printSeperator()
    logger.info(f"[ARB #{recipe['info']['currentRoundTripCount']}] Bridge Fees Calculated")
    Utils.printSeperator()

    logger.info(f"Bridge Total Fee: ${recipe['status']['fees']['total']}")

    return recipe

def executeBridge(amountToBridge, tokenDecimals, fromChain, toChain, fromToken, toToken, rpcURL):

    walletAddress = Wallet.getWalletAddressFromPrivateKey(rpcURL)

    amountToBridgeWei = getTokenDecimalValue(amountToBridge, tokenDecimals)

    bridgeTransaction = \
        generateUnsignedBridgeTransaction(
            fromChain=fromChain,
            toChain=toChain,
            fromToken=fromToken,
            toToken=toToken,
            amountFrom=amountToBridgeWei,
            addressTo=walletAddress
        )

    w3 = Web3(Web3.HTTPProvider(rpcURL))

    transaction = {
        'nonce': w3.eth.getTransactionCount(walletAddress),
        "chainId": bridgeTransaction["chainId"],
        'to': bridgeTransaction["to"],
        'gas': 100206,
        'gasPrice': w3.eth.gas_price,
        'data': bridgeTransaction["unsigned_data"],
        'value': int(bridgeTransaction["value"])
    }

    privateKey = Wallet.getPrivateKey()

    signedTransaction = w3.eth.account.sign_transaction(transaction, privateKey)

    sentTransaction = w3.eth.send_raw_transaction(signedTransaction.rawTransaction)

    transactionDetails = w3.eth.waitForTransactionReceipt(sentTransaction)

    transactionID = transactionDetails["transactionHash"].hex()

    logger.info(f"Sent bridge transaction: {transactionID}")

    status = checkBridgeStatus(toChain=toChain, fromChainTxnHash=sentTransaction)

    transactionSuccessful = bool(transactionDetails["status"])

    x = 1

    # transactionID = "0x97a0132993a148ed7b2c3a8e8d651f28e41cf7245c6fd728158b1262a376cb1b"
    #
    # arbitragePlan[arbitragePlan["currentBridgeDirection"]]["bridgeResult"] = {
    #             "AmountSent": arbitragePlan[arbitragePlan["currentBridgeDirection"]]["amountSent"],
    #             "Successful": True,
    #             "TransactionType": "Bridge",
    #             "ID": transactionID,
    #             "TransactionObject": tx,
    #             "Timestamp": Utils.getCurrentDateTime()
    #         }

    return True