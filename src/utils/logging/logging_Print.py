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

    recipe["status"]["telegramStatusMessage"] = sentMessage

    return recipe


# Print the Arbitrage is profitable alert
def printArbitrageComplete(recipe, wasRollback, wasProfitable, profitLoss, profitPercentage):
    
    from src.apis.telegramBot.telegramBot_Action import appendToMessage, sendMessage
    from src.apis.firebaseDB.firebaseDB_Actions import writeResultToDB

    finishingTime = time.perf_counter()
    timeTook = finishingTime - recipe["status"]["startingTime"]

    if wasRollback:
        typeString = f"Rollback"
        separatorString = "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"
    else:
        separatorString = "$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$"
        typeString = f"Arbitrage"

    timeString = f"Completed {typeString} In {getMinSecString(timeTook)}"

    logger.info(separatorString)
    logger.info(f"{typeString} #{recipe['status']['currentRoundTrip']} Done")

    if wasProfitable:
        logger.info(f"Made A Profit Of ${profitLoss} ({profitPercentage}%)")
        appendToMessage(messageToAppendTo=recipe["status"]["telegramStatusMessage"],
                        messageToAppend=f"Made A Profit Of ${round(profitLoss, 2)} ({profitPercentage}%) 👍\n")
    else:
        logger.info(f"Made A Loss Of ${profitLoss} ({profitPercentage}%)")
        appendToMessage(messageToAppendTo=recipe["status"]["telegramStatusMessage"],
                        messageToAppend=f"Made A Loss Of ${round(profitLoss, 2)} ({profitPercentage}%) 👎\n")

    logger.info(timeString)
    logger.info(separatorString)

    sendMessage(msg="@lukehalley done")

    logger.info("Writing result to Firebase...")
    result = {
        "wasProfitable": wasProfitable,
        "profitLoss": profitLoss,
        "percentageDifference": profitPercentage,
        "timeTookSeconds": timeTook,
        "wasRollback": wasRollback
    }
    writeResultToDB(result=result, currentRoundTrip=recipe['status']['currentRoundTrip'])
    logger.info("Result written to Firebase ✅")
    printSeparator(newLine=True)

# Print a separator line
def printSeparator(newLine=False):
    if newLine:
        line = ("--------------------------------\n")
    else:
        line = ("--------------------------------")

    logger.info(line)
