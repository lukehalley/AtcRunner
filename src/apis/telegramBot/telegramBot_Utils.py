import os

from telegram import Bot

from src.utils.env.env_AWSSecrets import checkIsDocker
from src.utils.env.env_Docker import getAWSSecret
from src.utils.logging.logging_Setup import getProjectLogger
from src.utils.retry.retry_Params import getRetryParams

logger = getProjectLogger()

httpRetryLimit, httpRetryDelay = getRetryParams(retryType="http")

def getTelegramBot():
    return Bot(getAWSSecret(key="TELEGRAM_BOT_TOKEN"))

def getTelegramChannelID():
    telegramChannelEnv = "TELEGRAM_ARBITRAGE_NOTIFICATION_CHANNEL_ID"
    if checkIsDocker():
        arbitrageNotificationID = os.getenv(f"{telegramChannelEnv}_PROD")
    else:
        arbitrageNotificationID = os.getenv(f"{telegramChannelEnv}_DEV")
    return arbitrageNotificationID

def getTelegramHangingChannelID():
    return os.getenv("TELEGRAM_ARBITRAGE_BRIDGE_CHANNEL_ID")

def getTelegramStuckMentions():
    usernames = ["Parsa2400", "TomyLBT"]
    mentionStr = " ".join(["@" + s for s in usernames])

    return usernames, mentionStr