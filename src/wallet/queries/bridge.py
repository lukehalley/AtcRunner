import logging, time, sys, os

from retry import retry

from src.utils.general import printSeperator, getMinSecString
from src.api.synapsebridge import estimateBridgeOutput, checkBridgeStatus
from src.data.fees import addFee

# Set up our logging
logger = logging.getLogger("DFK-DEX")

transactionRetryLimit = int(os.environ.get("TRANSACTION_RETRY_LIMIT"))
transactionRetryDelay = int(os.environ.get("TRANSACTION_RETRY_DELAY"))

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def waitForBridgeToComplete(transactionId, toToken, toChain, timeout=600):

    timeoutMins = int(timeout / 60)

    logger.info(f"Waiting for bridge to complete with a timeout of {timeoutMins} minutes...")

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
        logger.info(f'✅ Bridging {toToken} successful, took {timerString}!')
    elif bridgeTimedOut:
        errMsg = f'⛔️ Waiting for funds to bridge timed out - Bridging was unsuccessful!'
        logger.error(errMsg)
        raise Exception(errMsg)

    return fundsBridged