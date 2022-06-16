import functools, logging, os, re, time
import sys
from datetime import datetime
from math import log10, floor
from time import strftime, gmtime
from distutils import util
from pathlib import Path
from collections import OrderedDict

logger = logging.getLogger("DFK-DEX")

from src.api.telegrambot import sendMessage

# Get the root of the python project
def get_project_root() -> Path:
    return Path(__file__).parent.parent

# Convert a str to a bool
def strToBool(x):
    if type(x)==bool:
        return x
    else:
        return util.strtobool(x)

# Check if we are running in a docker container
def checkIsDocker():
    path = '/proc/self/cgroup'
    result = os.path.exists('/.dockerenv') or os.path.isfile(path) and any('docker' in line for line in open(path))
    return (result)

# Print the current round trip count
def printRoundtrip(count):
    logger.info("################################")
    logger.info(f"STARTING ARBITRAGE #{count}")
    logger.info("################################\n")

# Print the Arbitrage is profitable alert
def printArbitrageProfitable(count):
    logger.info("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    logger.info(f"ARBITRAGE #{count} PROFITABLE")
    logger.info("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n")

    sentMessage = sendMessage(
        msg=
            f"Arbitrage #{count} Identified As Profitable 🤑\n"
            f""
    )

    return sentMessage

# Print the Arbitrage is profitable alert
def printArbitrageResult(count, amount, percentageDifference, wasProfitable, startingTime):
    finishingTime = time.perf_counter()
    timeString = f"Completed Arbitrage In {startingTime - finishingTime:0.4f} Seconds"
    if wasProfitable:
        logger.info("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
        logger.info(f"ARBITRAGE #{count} RESULT")
        logger.info(f"Made A Profit Of ${amount} ({percentageDifference}%)")
        logger.info(timeString)
        logger.info("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n")
    else:
        logger.info("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
        logger.info(f"ARBITRAGE #{count} RESULT")
        logger.info(f"Made A Loss Of ${amount} ({percentageDifference}%)")
        logger.info(timeString)
        logger.info("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\n")
    printSeperator(True)
    sys.exit()

# Print a seperator line
def printSeperator(newLine=False):

    if newLine:
        line = ("--------------------------------\n")
    else:
        line = ("--------------------------------")

    logger.info(line)

# Get percentage of a number
def percentage(percent, whole):
  return (percent * float(whole)) / 100.0

def percentageDifference(a, b, rnd=6):
    return round((((a - b) * 100) / b), rnd)

# Check what percentage a number is of another number
def percentageOf(part, whole):
  return 100 * float(part)/float(whole)

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
def isBetween(a, x, b):
    return min(a, b) < x < max(a, b)

# Replace a value in all values in a dict
def replace_all(text, dictionary):
    return functools.reduce(lambda a, kv: a.replace(*kv), dictionary.items(), text)

# Find exponent of a number
def find_exp(number) -> int:
    base10 = log10(abs(number))
    return abs(floor(base10))

# Move a decimal point for a float
def moveDecimalPoint(num, decimal_places):
    num = float(num)

    for _ in range(abs(decimal_places)):

        if decimal_places > 0:
            num *= 10
        else:
            num /= 10.

    return float(num)

# Calculate how many times we can query
def calculateQueryInterval(recipeCount):
    requestLimit = float(os.environ.get("REQUEST_LIMIT"))
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