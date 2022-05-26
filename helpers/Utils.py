import functools
import logging
import os
from datetime import datetime
import re

logger = logging.getLogger("DFK-DEX")

def checkIsDocker():
    path = '/proc/self/cgroup'
    result = os.path.exists('/.dockerenv') or os.path.isfile(path) and any('docker' in line for line in open(path))
    return (result)

def printSeperator(newLine=False):

    if newLine:
        line = ("--------------------------------\n")
    else:
        line = ("--------------------------------")

    logger.info(line)


def printRoundtrip(count):
    logger.info("################################")
    logger.info(f"STARTING ARBITRAGE #{count}")
    logger.info("################################\n")


def percentage(percent, whole):
  return (percent * whole) / 100.0

def percentageOf(part, whole):
  return 100 * float(part)/float(whole)

def getCurrentDateTime():
    return datetime.now().strftime(os.environ.get("DATE_FORMAT"))

def camelCaseSplit(identifier):
    matches = re.finditer('.+?(?:(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])|$)', identifier)
    return [m.group(0) for m in matches]

def isBetween(a, x, b):
    return min(a, b) < x < max(a, b)

def replace_all(text, dictionary):
    return functools.reduce(lambda a, kv: a.replace(*kv), dictionary.items(), text)