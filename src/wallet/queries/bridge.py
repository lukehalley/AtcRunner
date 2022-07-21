import logging
import os
import time

from retry import retry

from src.api.synapsebridge import checkBridgeStatusAPI, checkBridgeStatusBalance
from src.api.telegrambot import notifyHangingBridge, notifyUnstickedBridge
from src.utils.general import getMinSecString

logger = logging.getLogger("DFK-DEX")

transactionRetryLimit = int(os.environ.get("TRANSACTION_RETRY_LIMIT"))
transactionRetryDelay = int(os.environ.get("TRANSACTION_RETRY_DELAY"))

bridgeWaitTimeout = int(os.environ.get("BRIDGE_TIMEOUT_SECS"))
bridgeStuckLimitMin = int(os.environ.get("BRIDGE_STUCK_MINS_LIMIT"))

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def waitForBridgeToComplete(transactionId, toToken, fromChain, toChain, toChainRPCURL, toTokenAddress, toTokenDecimals, predictions, stepNumber):

    timeout = bridgeWaitTimeout

    timeoutMins = int(timeout / 60)

    logger.info(f"Waiting for bridge to complete with a timeout of {timeoutMins} minutes...")

    minutesWaiting = 0
    secondSegment = 60

    fundsBridgedAPI = False
    fundsBridgedBalance = False
    bridgeTransactionNotificationSent = False

    startingTime = time.time()
    segmentTime = startingTime
    timeoutTime = startingTime + timeout
    while True:

        if fundsBridgedAPI or fundsBridgedBalance:
            bridgeTimedOut = False
            break

        if time.time() > timeoutTime:
            bridgeTimedOut = True
            break

        if time.time() - segmentTime > secondSegment:
            minutesWaiting = minutesWaiting + 1
            logger.info(f"{minutesWaiting} Mins Have Elapsed...")
            segmentTime = time.time()

        if minutesWaiting >= bridgeStuckLimitMin and not bridgeTransactionNotificationSent:
            logger.info(f'Bridge Stuck - Sending Hanging Bridge Notification...')
            notifyHangingBridge(fromChainId=fromChain, transactionId=transactionId)
            logger.info(f'Notification Sent!')
            bridgeTransactionNotificationSent = True

        fundsBridgedAPI = checkBridgeStatusAPI(toChain=toChain, fromChainTxnHash=transactionId)["isComplete"]

        fundsBridgedBalance = checkBridgeStatusBalance(predictions=predictions, stepNumber=stepNumber, toChainRPCURL=toChainRPCURL, toTokenAddress=toTokenAddress, toTokenDecimals=toTokenDecimals)

        time.sleep(0)

    if fundsBridgedAPI or fundsBridgedBalance:

        if bridgeTransactionNotificationSent:
            notifyUnstickedBridge(transactionId=transactionId)

        timerString = getMinSecString(time.time() - startingTime)
        logger.info(f'✅ Bridging {toToken} successful, took {timerString}!')
    elif bridgeTimedOut:
        errMsg = f'⛔️ Waiting for funds to bridge timed out - Bridging was unsuccessful!'
        logger.error(errMsg)
        raise Exception(errMsg)

    return fundsBridgedAPI or fundsBridgedBalance