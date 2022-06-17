import logging, os
from dotenv import load_dotenv
from telegram import Bot

load_dotenv()
token = os.getenv("TELEGRAM_BOT_TOKEN")
channelId = os.getenv("TELEGRAM_BOT_CHANNEL_ID")

logger = logging.getLogger("DFK-DEX")

bot = Bot(token)

def sendMessage(msg):
    result = bot.send_message(channelId, msg)

    return result

def appendToMessage(originalMessage, messageToAppend):
    originalText = originalMessage["text"]

    newText = f"{originalText}\n{messageToAppend}"

    updatedMessage = bot.edit_message_text(chat_id=originalMessage.chat_id,
                          message_id=originalMessage.message_id,
                          text=newText)

    return updatedMessage

def updatedStatusMessage(originalMessage, newStatus):

    originalText = originalMessage["text"]
    statusText = originalText[-1]
    newText = originalText.replace(statusText, newStatus)

    updatedMessage = bot.edit_message_text(chat_id=originalMessage.chat_id,
                          message_id=originalMessage.message_id,
                          text=newText)

    return updatedMessage