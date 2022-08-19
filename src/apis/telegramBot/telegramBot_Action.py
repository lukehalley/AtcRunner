from retry import retry

from src.apis.telegramBot.telegramBot_Utils import getTelegramBot, getTelegramChannelID, getTelegramHangingChannelID, \
    getTelegramStuckMentions
from src.utils.logging.logging_Setup import getProjectLogger
from src.utils.retry.retry_Params import getRetryParams

logger = getProjectLogger()

httpRetryLimit, httpRetryDelay = getRetryParams(retryType="http")

bot = getTelegramBot()

telegramChannelID = getTelegramChannelID()
hangingTelegramChannelID = getTelegramHangingChannelID()

usernames, mentionStr = getTelegramStuckMentions()

# Send a message to a Telegram channel
@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def sendMessage(msg, channelId=telegramChannelID):
    result = bot.send_message(channelId, msg)
    return result

# Add another line to a message
@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def appendToMessage(recipe, messageToAppend):

    originalText = recipe["status"]["telegramMessage"]["text"]

    newText = f"{originalText}\n{messageToAppend}"

    try:
        recipe["status"]["telegramMessage"] = bot.edit_message_text(chat_id=recipe["status"]["telegramMessage"].chat_id,
                                               message_id=recipe["status"]["telegramMessage"].message_id,
                                               text=newText)
        return recipe
    except Exception as e:
        isKnownTransactionError = "specified new message content and reply markup are exactly the same" in str(e)
        if isKnownTransactionError:
            pass
        else:
            raise Exception(str(e))

# Update the emoji at the end of a message
@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def updateStatusMessage(originalMessage, newStatus):

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

# Send a alert of a stuck bridge into the Synapse bridge support chat
def notifyHangingBridge(fromChainId, transactionId):

    msg = \
        f"!unsticktx {transactionId} {fromChainId}\n" \
        f"{mentionStr}"

    sendMessage(msg, channelId=hangingTelegramChannelID)

# Send a alert of a now un-stuck bridge into the Synapse bridge support chat
def notifyUnstickedBridge(transactionId):

    msg = \
        f"{transactionId} unstuck ✅\n" \
        f"{mentionStr}"

    sendMessage(msg, channelId=hangingTelegramChannelID)