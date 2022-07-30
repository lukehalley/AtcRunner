import logging
import os

from dotenv import load_dotenv
from retry import retry
from telegram import Bot

from src.utils.general import getAWSSecret, checkIsDocker

load_dotenv()
token = os.getenv("TELEGRAM_BOT_TOKEN")

telegramChannelEnv = "TELEGRAM_ARBITRAGE_NOTIFICATION_CHANNEL_ID"
if checkIsDocker():
    arbitrageNotificationID = os.getenv(f"{telegramChannelEnv}_PROD")
else:
    arbitrageNotificationID = os.getenv(f"{telegramChannelEnv}_DEV")

arbitrageHangingBridgeID = os.getenv("TELEGRAM_ARBITRAGE_BRIDGE_CHANNEL_ID")

logger = logging.getLogger("DFK-DEX")

bot = Bot(getAWSSecret(key="TELEGRAM_BOT_TOKEN"))

# Retry Envs
httpRetryLimit = int(os.environ.get("HTTP_RETRY_LIMIT"))
httpRetryDelay = int(os.environ.get("HTTP_RETRY_DELAY"))

usernames = ["Parsa2400", "TomyLBT"]
mentionStr = " ".join(["@" + s for s in usernames])

@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def sendMessage(msg, channelId=arbitrageNotificationID):
    result = bot.send_message(channelId, msg)
    return result

@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def appendToMessage(originalMessage, messageToAppend):
    originalText = originalMessage["text"]

    newText = f"{originalText}\n{messageToAppend}"

    try:
        updatedMessage = bot.edit_message_text(chat_id=originalMessage.chat_id,
                                               message_id=originalMessage.message_id,
                                               text=newText)
        return updatedMessage
    except Exception as e:
        isKnownTransactionError = "specified new message content and reply markup are exactly the same" in str(e)
        if isKnownTransactionError:
            pass
        else:
            raise Exception(str(e))


@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def updatedStatusMessage(originalMessage, newStatus):

    originalText = originalMessage["text"]

    if originalText != newStatus:
        statusText = originalText[:-1]
        newText = statusText + newStatus

        try:
            updatedMessage = bot.edit_message_text(chat_id=originalMessage.chat_id,
                                                   message_id=originalMessage.message_id,
                                                   text=newText)
            return updatedMessage
        except Exception as e:
            isKnownTransactionError = "specified new message content and reply markup are exactly the same" in str(e)
            if isKnownTransactionError:
                pass
            else:
                raise Exception(str(e))

    else:
        logger.info("Telegram message same as before - not updating.")
        return

def notifyHangingBridge(fromChainId, transactionId):

    msg = \
        f"!unsticktx {transactionId} {fromChainId}\n" \
        f"{mentionStr}"

    sendMessage(msg, channelId=arbitrageHangingBridgeID)

def notifyUnstickedBridge(transactionId):

    msg = \
        f"{transactionId} unstuck ✅\n" \
        f"{mentionStr}"

    sendMessage(msg, channelId=arbitrageHangingBridgeID)