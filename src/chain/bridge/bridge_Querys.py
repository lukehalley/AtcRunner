import os
import time

from retry import retry

from src.apis.synapseBridge.synapseBridge_Querys import queryBridgeStatusAPI, queryBridgeStatusBalance
from src.apis.telegramBot.telegramBot_Action import notifyHangingBridge, notifyUnstickedBridge
from src.utils.logging.logging_Print import printSeparator
from src.utils.logging.logging_Setup import getProjectLogger
from src.utils.time.time_Calculations import getMinSecString

logger = getProjectLogger()

transactionRetryLimit = int(os.environ.get("TRANSACTION_QUERY_RETRY_LIMIT"))
transactionRetryDelay = int(os.environ.get("TRANSACTION_QUERY_RETRY_DELAY"))

bridgeWaitTimeout = int(os.environ.get("BRIDGE_TIMEOUT_SECS"))
bridgeStuckLimitMin = int(os.environ.get("BRIDGE_STUCK_MINS_LIMIT"))


@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def waitForBridgeToComplete(transactionId, fromChain, toChain, toChainRPCURL, toTokenAddress, toTokenDecimals,
                            stepNumber, wethContractABI, predictions=None):
    timeout = bridgeWaitTimeout

    timeoutMins = int(timeout / 60)

    printSeparator()

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
            notifyHangingBridge(fromChain=fromChain, transactionId=transactionId)
            logger.info(f'Notification Sent!')
            bridgeTransactionNotificationSent = True

        fundsBridgedAPI = queryBridgeStatusAPI(toChain=toChain, fromChainTxnHash=transactionId)["isComplete"]

        if predictions:
            fundsBridgedBalance = queryBridgeStatusBalance(predictions=predictions, stepNumber=stepNumber,
                                                           toChainRPCURL=toChainRPCURL, toTokenAddress=toTokenAddress,
                                                           toTokenDecimals=toTokenDecimals,
                                                           wethContractABI=wethContractABI)

        time.sleep(0)

    if fundsBridgedAPI or fundsBridgedBalance:

        if bridgeTransactionNotificationSent:
            notifyUnstickedBridge(transactionId=transactionId)

        timerString = getMinSecString(time.time() - startingTime)
        logger.info(f'✅ Bridging successful, took {timerString}!')
    elif bridgeTimedOut:
        errMsg = f'⛔️ Waiting for funds to bridge timed out - Bridging was unsuccessful!'
        logger.error(errMsg)
        raise Exception(errMsg)

    return fundsBridgedAPI or fundsBridgedBalance
