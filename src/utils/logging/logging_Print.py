import time

from src.utils.logging.logging_Setup import getProjectLogger
from src.utils.time.time_Calculations import getMinSecString

logger = getProjectLogger()

# Print the current round trip count
def printRoundtrip(count):
    logger.info("################################")
    logger.info(f"STARTING ARBITRAGE #{count}")
    logger.info("################################\n")

# Print the Arbitrage is profitable alert
def printSettingUpWallet(count):
    from src.apis.telegramBot.telegramBot_Action import sendMessage

    logger.info("--------------------------------")
    logger.info(f" Correcting Wallet Setup State ")

    sentMessage = sendMessage(
        msg=
            f"Arbitrage #{count} Setup ⚙️\n"
            f"Tokens -> Stables"
    )

    return sentMessage

# Print the Arbitrage is profitable alert
def printArbitrageProfitable(recipe):
    from src.apis.telegramBot.telegramBot_Action import sendMessage

    count = recipe['status']['currentRoundTrip']
    networkPath = f'{recipe["origin"]["chain"]["name"]} -> {recipe["destination"]["chain"]["name"]}'
    tokenPath = f'{recipe["origin"]["token"]["symbol"]} -> {recipe["destination"]["token"]["symbol"]}'

    logger.info("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    logger.info(f"ARBITRAGE #{count} PROFITABLE")
    logger.info("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n")

    sentMessage = sendMessage(
        msg=
            f"Arbitrage #{count} Profitable 🤑\n"
            f"{networkPath}\n"
            f"{tokenPath}\n"
            f"${recipe['arbitrage']['predictions']['startingStables']} -> ${recipe['arbitrage']['predictions']['outStables']}\n"
            f"Profit: ${recipe['arbitrage']['predictions']['profitLoss']} | {recipe['arbitrage']['predictions']['arbitragePercentage']}%"
    )

    recipe["status"]["telegramMessage"] = sentMessage

    return recipe

# Print the Arbitrage is profitable alert
def printArbitrageRollbackComplete(count, wasProfitable, profitLoss, arbitragePercentage, startingTime, telegramStatusMessage):
    from src.apis.telegramBot.telegramBot_Action import appendToMessage, sendMessage
    from src.apis.firebaseDB.firebaseDB_Actions import writeResultToDB

    finishingTime = time.perf_counter()
    timeTook = finishingTime - startingTime
    timeString = f"Completed Arbitrage Rollback In {getMinSecString(timeTook)}"

    if wasProfitable:
        logger.info("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<")
        logger.info(f"ROLLBACK #{count} DONE")
        logger.info(f"Made A Profit Of ${profitLoss} ({arbitragePercentage}%)")
        appendToMessage(messageToAppendTo=telegramStatusMessage,
                        messageToAppend=f"Made A Profit Of ${round(profitLoss, 2)} ({arbitragePercentage}%) 👍\n")
        logger.info(timeString)
        logger.info("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<")
    else:
        logger.info("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<")
        logger.info(f"ROLLBACK #{count} DONE")
        logger.info(f"Made A Loss Of ${profitLoss} ({arbitragePercentage}%)")
        appendToMessage(messageToAppendTo=telegramStatusMessage,
                        messageToAppend=f"Made A Loss Of ${round(profitLoss, 2)} ({arbitragePercentage}%) 👎\n")
        logger.info(timeString)
        logger.info("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<")

    sendMessage(msg="@lukehalley done")

    logger.info("Writing result to Firebase...")
    result = {
        "wasProfitable": wasProfitable,
        "profitLoss": profitLoss,
        "percentageDifference": arbitragePercentage,
        "timeTookSeconds": timeTook,
        "wasRollback": True
    }
    writeResultToDB(result=result, roundTrip=count)
    logger.info("Result written to Firebase ✅")
    printSeperator(True)

# Print the Arbitrage is profitable alert
def printArbitrageResult(count, amount, percentageDifference, wasProfitable, startingTime, telegramStatusMessage):
    from src.apis.telegramBot.telegramBot_Action import appendToMessage, sendMessage
    from src.apis.firebaseDB.firebaseDB_Actions import writeResultToDB

    finishingTime = time.perf_counter()
    timeTook = finishingTime - startingTime
    timeString = f"Completed Arbitrage In {getMinSecString(timeTook)}"
    if wasProfitable:
        logger.info("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
        logger.info(f"ARBITRAGE #{count} ROLLBACK RESULT")
        logger.info(f"Made A Profit Of ${amount} ({percentageDifference}%)")
        appendToMessage(messageToAppendTo=telegramStatusMessage, messageToAppend=f"Made A Profit Of ${round(amount, 2)} ({percentageDifference}%) 👍\n")
        logger.info(timeString)
        logger.info("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n")
    else:
        logger.info("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
        logger.info(f"ARBITRAGE #{count} ROLLBACK RESULT")
        logger.info(f"Made A Loss Of ${amount} ({percentageDifference}%)")
        appendToMessage(messageToAppendTo=telegramStatusMessage, messageToAppend=f"Made A Loss Of ${round(amount, 2)} ({percentageDifference}%) 👎\n")
        logger.info(timeString)
        logger.info("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n")

    sendMessage(msg="@lukehalley done")

    logger.info("Writing result to Firebase...")
    result = {
        "wasProfitable": wasProfitable,
        "profitLoss": float(amount),
        "percentageDifference": float(percentageDifference),
        "timeTookSeconds": timeTook,
        "wasRollback": False
    }
    writeResultToDB(result=result, roundTrip=count)
    logger.info("Result written to Firebase\n")

    printSeperator(True)

# Print a seperator line
def printSeperator(newLine=False):

    if newLine:
        line = ("--------------------------------\n")
    else:
        line = ("--------------------------------")

    logger.info(line)
