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

def editMessage(originalMessage, messageToAppend):
    originalText = originalMessage["text"]
    newText = f"{originalText}\n{messageToAppend}"

    bot.edit_message_text(chat_id=originalMessage.chat_id,
                          message_id=originalMessage.message_id,
                          text=newText)
    x = 1