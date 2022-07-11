import logging, os
from dotenv import load_dotenv
from retry import retry
from telegram import Bot

load_dotenv()
token = os.getenv("TELEGRAM_BOT_TOKEN")
channelId = os.getenv("TELEGRAM_BOT_CHANNEL_ID")

logger = logging.getLogger("DFK-DEX")

bot = Bot(token)

# Retry Envs
httpRetryLimit = int(os.environ.get("HTTP_RETRY_LIMIT"))
httpRetryDelay = int(os.environ.get("HTTP_RETRY_DELAY"))

@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def sendMessage(msg):
    result = bot.send_message(channelId, msg)
    return result

@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def appendToMessage(originalMessage, messageToAppend):
    originalText = originalMessage["text"]

    newText = f"{originalText}\n{messageToAppend}"

    updatedMessage = bot.edit_message_text(chat_id=originalMessage.chat_id,
                          message_id=originalMessage.message_id,
                          text=newText)

    return updatedMessage

@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def updatedStatusMessage(originalMessage, newStatus):

    originalText = originalMessage["text"]

    if originalText != newStatus:
        statusText = originalText[-1]
        newText = originalText.replace(statusText, newStatus)

        updatedMessage = bot.edit_message_text(chat_id=originalMessage.chat_id,
                              message_id=originalMessage.message_id,
                              text=newText)


        return updatedMessage
    else:
        logger.info("Telegram message same as before - not updating.")
        return