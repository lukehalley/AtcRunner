import logging, time

from src.utils.general import printSeperator, getMinSecString
from src.api.synapsebridge import estimateBridgeOutput, checkBridgeStatus
from src.data.fees import addFee

# Set up our logging
logger = logging.getLogger("DFK-DEX")

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

        timerString = getMinSecString(time.time() - startingTime)
        logger.info(f'Bridging {toToken} successful!')
        logger.info(f'Took {timerString}')
    elif bridgeTimedOut:
        logger.warning(f'Waiting for funds to bridge timed out - Bridging was unsuccessful!')

    return fundsBridged

# Calculate bridge fees
def calculateSynapseBridgeFees(recipe):

    bridgeDict = {
        "originToDestination": {
            "position": "origin"
        },
        "destinationToOrigin": {
            "position": "destination"
        }
    }

    feeDict = {}

    directionList = ("origin", "destination")

    printSeperator()
    logger.info(f"[ARB #{recipe['info']['currentRoundTripCount']}] "
                f"Calculating Bridge Fees For Arbitrage")
    printSeperator()

    for tripName, settings in bridgeDict.items():

        direction = settings["position"]

        if direction == "origin":
            tokenType = "token"
            index = 1
        else:
            tokenType = "stablecoin"
            index = 0

        currentOrigin = recipe[direction]
        oppositeDirection = directionList[index]
        currentDestination = recipe[oppositeDirection]

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
            feeDict[tripName] = bridgeQuote["bridgeFee"] * currentOrigin[tokenType]["price"]
        else:
            feeDict[tripName] = bridgeQuote["bridgeFee"]

        bridgeToken = currentOrigin[tokenType]["symbol"]
        logger.info(f'{direction} -> {oppositeDirection}: receive {amountToReceive} {bridgeToken} with a fee of {feeDict[tripName]} {bridgeToken}')

    recipe = addFee(recipe=recipe, fee=feeDict, section="bridge")

    printSeperator()

    logger.info(f"Bridge Fees Total: ${recipe['status']['fees']['bridge']['subTotal']}")

    return recipe