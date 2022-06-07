import os
import time

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
    return str(format(float(amount) * (10 ** decimalPlaces), f'.0f'))


def getTokenNormalValue(amount, decimalPlaces=18):
    return str(format(float(amount) / (10 ** decimalPlaces), f'.{decimalPlaces}f'))


def buildApiURL(endpoint):
    return f"{synapseAPIBaseURL}/{endpoint}"

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def checkBridgeStatus(toChain, fromChainTxnHash):
    params = {'toChain': toChain, 'fromChainTxnHash': fromChainTxnHash}
    endpoint = buildApiURL(os.getenv("SYNAPSE_CHECK_BRIDGE_STATUS_ENDPOINT"))

    return (requests.get(endpoint, params=params)).json()

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def checkSwapSupported(fromChain, toChain, fromToken, toToken):
    params = {"fromChain": fromChain, "toChain": toChain, "fromToken": fromToken, "toToken": toToken}
    endpoint = buildApiURL(os.getenv("SYNAPSE_CHECK_SWAP_SUPPORTED_ENDPOINT"))

    return (requests.get(endpoint, params=params)).json()

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def estimateBridgeOutput(fromChain, toChain, fromToken, toToken, amountToBridge, decimalPlacesFrom, decimalPlacesTo,
                         returning=False):
    if returning:
        x = decimalPlacesFrom
        decimalPlacesFrom = decimalPlacesTo
        decimalPlacesTo = x

    amountFromDecimal = getTokenDecimalValue(amountToBridge, decimalPlacesTo)
    params = {"fromChain": fromChain, "toChain": toChain, "fromToken": fromToken, "toToken": toToken,
              "amountFrom": amountFromDecimal}
    endpoint = buildApiURL(os.getenv("SYNAPSE_ESTIMATE_BRIDGE_OUTPUT_ENDPOINT"))
    result = (requests.get(endpoint, params=params)).json()
    amountToReceive = float(getTokenNormalValue(result["amountToReceive"], decimalPlacesFrom))
    bridgeFeeManual = amountToBridge - amountToReceive
    bridgeFee = float(getTokenNormalValue(result["bridgeFee"], 18))
    bridgeQuote = {'amountToReceive': amountToReceive, 'bridgeFee': bridgeFee}
    return bridgeQuote

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def estimateSwapOutput(chain, fromToken, toToken, amountIn):
    params = {"chain": chain, "fromToken": fromToken, "toToken": toToken, "amountIn": amountIn}
    endpoint = buildApiURL(os.getenv("SYNAPSE_ESTIMATE_SWAP_OUTPUT_ENDPOINT"))

    return (requests.get(endpoint, params=params)).json()

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def generateSwapTransaction(chain, fromToken, toToken, amountIn):
    params = {"chain": chain, "fromToken": fromToken, "toToken": toToken, "amountIn": amountIn}
    endpoint = buildApiURL(os.getenv("SYNAPSE_GENERATE_SWAP_TRANSACTION_ENDPOINT"))

    return (requests.get(endpoint, params=params)).json()

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def generateUnsignedBridgeApprovalTransaction(fromChain, fromToken):
    params = {"fromChain": fromChain, "fromToken": fromToken}
    endpoint = buildApiURL(os.getenv("SYNAPSE_GENERATE_UNSIGNED_BRIDGE_APPROVAL_TRANSACTION_ENDPOINT"))

    return (requests.get(endpoint, params=params)).json()

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def generateUnsignedBridgeTransaction(fromChain, toChain, fromToken, toToken, amountFrom, addressTo):
    params = {"fromChain": fromChain, "toChain": toChain, "fromToken": fromToken, "toToken": toToken,
              "amountFrom": amountFrom, "addressTo": addressTo}
    endpoint = buildApiURL(os.getenv("SYNAPSE_GENERATE_UNSIGNED_BRIDGE_TRANSACTION_ENDPOINT"))

    return (requests.get(endpoint, params=params)).json()

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getBridgeableTokens(chain):
    params = {"chain": chain}
    endpoint = buildApiURL(os.getenv("SYNAPSE_GET_BRIDGEABLE_TOKENS_ENDPOINT"))

    return (requests.get(endpoint, params=params)).json()

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getChainsForToken(token):
    params = {"token": token}
    endpoint = buildApiURL(os.getenv("SYNAPSE_GET_CHAINS_FOR_TOKEN_ENDPOINT"))

    return (requests.get(endpoint, params=params)).json()

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getStableswapPools(chain):
    params = {"chain": chain}
    endpoint = buildApiURL(os.getenv("SYNAPSE_GET_STABLESWAP_POOLS_ENDPOINT"))

    return (requests.get(endpoint, params=params)).json()

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
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
            decimalPlacesFrom=currentOrigin[tokenType]["decimals"],
            decimalPlacesTo=currentDestination[tokenType]["decimals"],
            returning=(not direction == "origin"))

        amountToReceive = bridgeQuote["amountToReceive"]
        if tokenType == "token":
            bridgeFee = bridgeQuote["bridgeFee"] * currentOrigin[tokenType]["price"]
        else:
            bridgeFee = bridgeQuote["bridgeFee"]
        recipe = Data.addFee(recipe, bridgeFee, direction)

        bridgeToken = currentOrigin[tokenType]["symbol"]
        logger.info(
            f"After bridge we will receive {amountToReceive} {bridgeToken} with a fee of {bridgeFee} {bridgeToken}")

        Utils.printSeperator(True)

    Utils.printSeperator()
    logger.info(f"[ARB #{recipe['info']['currentRoundTripCount']}] Bridge Fees Calculated")
    Utils.printSeperator()

    logger.info(f"Bridge Total Fee: ${recipe['status']['fees']['total']}")

    return recipe

def executeBridge(amountToBridge, decimals, fromChain, toChain, fromToken, toToken, rpcURL):
    walletAddress = Wallet.getWalletAddressFromPrivateKey(rpcURL)

    amountToBridgeWei = getTokenDecimalValue(amountToBridge, decimals)

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

    testMode = True

    if testMode:

        transactionID = '0x21e240217d58cd7f7020ed432ae2767aacf643e7dd425c3f0d798e9c34040c79'

        transactionDetails = {'blockHash': '0xb853fd08b9aa44dc97f2027b7a6e8afd288d5840eb6e6fc7d0d60119b4857e46',
                              'blockNumber': 2875499,
                              'contractAddress': None,
                              'cumulativeGasUsed': 97177,
                              'effectiveGasPrice': 40000000,
                              'from': '0x919d17174Fb22CC1Cfc8748C208104EC62341791',
                              'gasUsed': 97177,
                              'logs': [{'address': '0xCCb93dABD71c8Dad03Fc4CE5559dC3D89F67a260',
                                        'topics': ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                                                   '0x0000000000000000000000000000000000000000000000000000000000000000',
                                                   '0x00000000000000000000000075224b0f245fe51d5bf47a898dbb6720d4150ba7'],
                                        'data': '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
                                        'blockNumber': 2875499,
                                        'transactionHash': '0x21e240217d58cd7f7020ed432ae2767aacf643e7dd425c3f0d798e9c34040c79',
                                        'transactionIndex': 0,
                                        'blockHash': '0xb853fd08b9aa44dc97f2027b7a6e8afd288d5840eb6e6fc7d0d60119b4857e46',
                                        'logIndex': 0,
                                        'removed': False},
                                       {'address': '0xE05c976d3f045D0E6E7A6f61083d98A15603cF6A',
                                        'topics': ['0x79c15604b92ef54d3f61f0c40caab8857927ca3d5092367163b4562c1699eb5f',
                                                   '0x000000000000000000000000919d17174fb22cc1cfc8748c208104ec62341791'],
                                        'data': '0x0000000000000000000000000000000000000000000000000000000063564c40000000000000000000000000ccb93dabd71c8dad03fc4ce5559dc3d89f67a2600000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000b0ed049ebe5000000000000000000000000000000000000000000000000000000000000629dfbb7',
                                        'blockNumber': 2875499,
                                        'transactionHash': '0x21e240217d58cd7f7020ed432ae2767aacf643e7dd425c3f0d798e9c34040c79',
                                        'transactionIndex': 0,
                                        'blockHash': '0xb853fd08b9aa44dc97f2027b7a6e8afd288d5840eb6e6fc7d0d60119b4857e46',
                                        'logIndex': 1,
                                        'removed': False},
                                       {'address': '0xCCb93dABD71c8Dad03Fc4CE5559dC3D89F67a260',
                                        'topics': ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                                                   '0x00000000000000000000000075224b0f245fe51d5bf47a898dbb6720d4150ba7',
                                                   '0x000000000000000000000000e05c976d3f045d0e6e7a6f61083d98a15603cf6a'],
                                        'data': '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
                                        'blockNumber': 2875499,
                                        'transactionHash': '0x21e240217d58cd7f7020ed432ae2767aacf643e7dd425c3f0d798e9c34040c79',
                                        'transactionIndex': 0,
                                        'blockHash': '0xb853fd08b9aa44dc97f2027b7a6e8afd288d5840eb6e6fc7d0d60119b4857e46',
                                        'logIndex': 2,
                                        'removed': False}],
                              'logsBloom': '0x00000000000000000002000000000000000000000000204000000000000200000000000000000000000000000000000801000000000000000000004000000400000000000000000000000028000000000000000000000000000000000000000400000000020000000000000000000800000000000000004000000010000000000000000000400000000000000000000000000000000804000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000100000000000000000000000000000000040100020200000000000000000000000000000000000000000000000000000000000000000',
                              'status': 1,
                              'to': '0x75224b0f245Fe51d5bf47A898DbB6720D4150BA7',
                              'transactionHash': '0x21e240217d58cd7f7020ed432ae2767aacf643e7dd425c3f0d798e9c34040c79',
                              'transactionIndex': 0,
                              'type': '0x0'}
    else:

        sentTransaction = w3.eth.send_raw_transaction(signedTransaction.rawTransaction)

        transactionDetails = w3.eth.waitForTransactionReceipt(sentTransaction)

        transactionID = transactionDetails["transactionHash"].hex()

    logger.info(f"Sent bridge transaction: {transactionID}")

    fundsBridged = waitForBridgeToComplete(
        transactionId=transactionID,
        amountSent=amountToBridge,
        toToken=toToken,
        toChain=toChain,
        timeout=600
    )

def waitForBridgeToComplete(transactionId, amountSent, toToken, toChain, timeout=600):

    timeoutMins = int(timeout / 60)

    logger.info(f"Waiting for bridge to complete with a timeout of {timeoutMins} minutes")
    logger.info(f'Expecting {amountSent} {toToken}')

    fundsBridged = False

    minutesWaiting = 0
    secondSegment = 60

    startingTime = time.time()
    segmentTime = startingTime
    timeoutTime = startingTime + timeout
    while True:

        if fundsBridged:
            bridgeTimedOut = False
            break

        if time.time() > timeoutTime:
            bridgeTimedOut = True
            break

        fundsBridged = checkBridgeStatus(toChain=toChain, fromChainTxnHash=transactionId)["isComplete"]

        if time.time() - segmentTime > secondSegment:
            minutesWaiting = minutesWaiting + 1
            logger.info(f"{minutesWaiting} Mins Have Elapsed...")
            segmentTime = time.time()

        time.sleep(1)

    if fundsBridged:

        timerString = Utils.getMinSecString(time.time() - startingTime)
        logger.info(f'Bridging {toToken} successful!')
        logger.info(f'Took {timerString}')
    elif bridgeTimedOut:
        logger.warning(f'Waiting for funds to bridge timed out - Bridging was unsuccessful!')

    return fundsBridged

