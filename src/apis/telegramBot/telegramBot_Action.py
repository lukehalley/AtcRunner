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
def appendToMessage(messageToAppendTo, messageToAppend):
    originalText = messageToAppendTo["text"]

    newText = f"{originalText}\n{messageToAppend}"

    try:
        updatedMessage = bot.edit_message_text(chat_id=messageToAppendTo.chat_id,
                                               message_id=messageToAppendTo.message_id,
                                               text=newText)
        return updatedMessage
    except Exception as e:
        isKnownTransactionError = "specified new message content and reply markup are exactly the same" in str(e)
        if isKnownTransactionError:
            pass
        else:
            raise Exception(str(e))


# Update the emoji at the end of a message
@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def updateStatusMessage(originalMessage, newStatus, lineIndex=-1):

    allowedStatusEmojis = ["✅", "⛔️", "📤", "⏳"]

    originalText = originalMessage["text"]

    if originalText != newStatus:

        if lineIndex == -1:
            statusText = originalText[:-1]
            newText = statusText + newStatus
        else:
            splitStatusText = originalText.split("\n")

            nthLine = splitStatusText[lineIndex]

            previousStatus = nthLine[-1]

            if previousStatus in allowedStatusEmojis:
                newLineText = nthLine[:-1] + newStatus
                splitStatusText[lineIndex] = newLineText
                newText = "\n".join(splitStatusText)
            else:
                return originalMessage

        try:
            updatedMessage = bot.edit_message_text(chat_id=originalMessage.chat_id,
                                                   message_id=originalMessage.message_id,
                                                   text=newText)
            return updatedMessage
        except Exception as e:
            sameTextError = "specified new message content and reply markup are exactly the same" in str(e)
            if sameTextError:
                return originalMessage
                pass
            else:
                raise Exception(str(e))
    else:
        logger.info("Telegram message same as before - not updating.")
        return originalMessage


@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def removeStatusMessage(originalMessage, lineIndex=-1):
    originalText = originalMessage["text"]
    splitStatusText = originalText.split("\n")

    del splitStatusText[lineIndex]

    newText = "\n".join(splitStatusText)

    try:
        updatedMessage = bot.edit_message_text(chat_id=originalMessage.chat_id,
                                               message_id=originalMessage.message_id,
                                               text=newText)
        return updatedMessage
    except Exception as e:
        sameTextError = "specified new message content and reply markup are exactly the same" in str(e)
        if sameTextError:
            return originalMessage
            pass
        else:
            raise Exception(str(e))


# Send a alert of a stuck bridge into the Synapse bridge support chat
def notifyHangingBridge(fromChain, transactionId):
    msg = \
        f"!unsticktx {transactionId} {fromChain}\n" \
        f"{mentionStr}"

    sendMessage(msg, channelId=hangingTelegramChannelID)


# Send a alert of a now un-stuck bridge into the Synapse bridge support chat
def notifyUnstickedBridge(transactionId):
    msg = \
        f"{transactionId} unstuck ✅\n" \
        f"{mentionStr}"

    sendMessage(msg, channelId=hangingTelegramChannelID)
