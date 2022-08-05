import functools
import json
import logging
import math
import os
import re
import time
from collections import OrderedDict
from datetime import datetime
from decimal import Decimal
from distutils import util
from math import log10, floor
from pathlib import Path
from time import strftime, gmtime

logger = logging.getLogger("DFK-DEX")

# Get the root of the python project
def getProjectRoot() -> Path:
    return Path(__file__).parent.parent

# Convert a str to a bool
def strToBool(x):
    if type(x)==bool:
        return x
    else:
        return util.strtobool(x)

# Check if we are running in a docker container
def checkIsDocker():
    return True if os.environ.get("AWS_DEFAULT_REGION") else False

# Print the current round trip count
def printRoundtrip(count):
    logger.info("################################")
    logger.info(f"STARTING ARBITRAGE #{count}")
    logger.info("################################\n")

# Print the Arbitrage is profitable alert
def printSettingUpWallet(count):
    from src.api.telegrambot import sendMessage

    logger.info("--------------------------------")
    logger.info(f" Correcting Wallet Setup State ")

    sentMessage = sendMessage(
        msg=
            f"Arbitrage #{count} Setup ⚙️\n"
            f"Tokens -> Stables"
    )

    return sentMessage

# Print the Arbitrage is profitable alert
def printArbitrageProfitable(count, predictions):
    from src.api.telegrambot import sendMessage
    logger.info("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    logger.info(f"ARBITRAGE #{count} PROFITABLE")
    logger.info("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n")

    sentMessage = sendMessage(
        msg=
            f"Arbitrage #{count} Profitable 🤑\n"
            f"${predictions['startingStables']} -> ${predictions['outStables']}\n"
            f"Profit: ${predictions['profitLoss']} | {predictions['arbitragePercentage']}%"
    )

    return sentMessage

# Print the Arbitrage is profitable alert
def printArbitrageRollbackComplete(count, wasProfitable, profitLoss, arbitragePercentage, startingTime, telegramStatusMessage):
    from src.api.telegrambot import appendToMessage, sendMessage
    from src.api.firebase import writeResultToDB

    finishingTime = time.perf_counter()
    timeTook = finishingTime - startingTime
    timeString = f"Completed Arbitrage Rollback In {getMinSecString(timeTook)}"

    if wasProfitable:
        logger.info("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<")
        logger.info(f"ROLLBACK #{count} DONE")
        logger.info(f"Made A Profit Of ${profitLoss} ({arbitragePercentage}%)")
        appendToMessage(originalMessage=telegramStatusMessage,
                        messageToAppend=f"Made A Profit Of ${round(profitLoss, 2)} ({arbitragePercentage}%) 👍\n")
        logger.info(timeString)
        logger.info("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<")
    else:
        logger.info("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<")
        logger.info(f"ROLLBACK #{count} DONE")
        logger.info(f"Made A Profit Of ${profitLoss} ({arbitragePercentage}%)")
        appendToMessage(originalMessage=telegramStatusMessage,
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
    writeResultToDB(result=result, arbitrageNumber=count)
    logger.info("Result written to Firebase ✅")
    printSeperator(True)

# Print the Arbitrage is profitable alert
def printArbitrageResult(count, amount, percentageDifference, wasProfitable, startingTime, telegramStatusMessage):
    from src.api.telegrambot import appendToMessage, sendMessage
    from src.api.firebase import writeResultToDB

    finishingTime = time.perf_counter()
    timeTook = finishingTime - startingTime
    timeString = f"Completed Arbitrage In {getMinSecString(timeTook)}"
    if wasProfitable:
        logger.info("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
        logger.info(f"ARBITRAGE #{count} ROLLBACK RESULT")
        logger.info(f"Made A Profit Of ${amount} ({percentageDifference}%)")
        appendToMessage(originalMessage=telegramStatusMessage, messageToAppend=f"Made A Profit Of ${round(amount, 2)} ({percentageDifference}%) 👍\n")
        logger.info(timeString)
        logger.info("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n")
    else:
        logger.info("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
        logger.info(f"ARBITRAGE #{count} ROLLBACK RESULT")
        logger.info(f"Made A Loss Of ${amount} ({percentageDifference}%)")
        appendToMessage(originalMessage=telegramStatusMessage, messageToAppend=f"Made A Loss Of ${round(amount, 2)} ({percentageDifference}%) 👎\n")
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
    writeResultToDB(result=result, arbitrageNumber=count)
    logger.info("Result written to Firebase\n")

    printSeperator(True)

# Print a seperator line
def printSeperator(newLine=False):

    if newLine:
        line = ("--------------------------------\n")
    else:
        line = ("--------------------------------")

    logger.info(line)

# Get percentage of a number
def percentage(percent, whole):
  return (Decimal(percent) * Decimal(whole)) / Decimal(100.0)

def percentageDifference(a, b, rnd=6):
    return round((((a - b) * 100) / b), rnd)

# Check what percentage a number is of another number
def percentageOf(part, whole):
  return 100 * Decimal(part)/Decimal(whole)

# Get current date time
def getCurrentDateTime():
    return datetime.now().strftime(os.environ.get("DATE_FORMAT"))

# Get time in min and sec format
def getMinSecString(time):
    format = os.getenv("TIMER_STR_FORMAT")
    return strftime(format, gmtime(time))

# Split by camelcase
def camelCaseSplit(identifier):
    matches = re.finditer('.+?(?:(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])|$)', identifier)
    return [m.group(0) for m in matches]

# Check if number is between two value
def isBetween(lowerLimit, middleNumber, upperLimit):
    return min(lowerLimit, upperLimit) < middleNumber < max(lowerLimit, upperLimit)

# Replace a value in all values in a dict
def replace_all(text, dictionary):
    return functools.reduce(lambda a, kv: a.replace(*kv), dictionary.items(), text)

# Find exponent of a number
def find_exp(number) -> int:
    base10 = log10(abs(number))
    return abs(floor(base10))

# Move a decimal point for a float
def moveDecimalPoint(num, decimal_places):
    num = Decimal(num)

    for _ in range(abs(decimal_places)):

        if decimal_places > 0:
            num *= 10
        else:
            num /= 10.

    return Decimal(num)

# Calculate how many times we can query
def calculateQueryInterval(recipeCount):
    requestLimit = Decimal(os.environ.get("REQUEST_LIMIT"))
    return 60 / (requestLimit / recipeCount)

def prependToOrderedDict(dictOriginal, dictAdd):
    arr = dictOriginal
    arr = OrderedDict(arr)
    new = dictAdd
    items = list(arr.items())
    items.append(new)
    arr = OrderedDict(items)
    arr.move_to_end(dictAdd[0], last=False)
    return arr

def truncateDecimal(f, n):
    return math.floor(f * 10 ** n) / 10 ** n

def getDictLength(sub):
    return len(sub)

def getAWSSecret(key):
    return json.loads(os.environ.get("ARB_SECRETS"))[key]

def findKeyInDict(keyToFind, dictToSearch):
    if keyToFind in dictToSearch:
        return dictToSearch[keyToFind]
    try:
        for v in dictToSearch.values():
            if isinstance(v, dict):
                return findKeyInDict(keyToFind, v)
    except:
        x = 1
    print(f"Couldn't find key: {keyToFind}")
    return None