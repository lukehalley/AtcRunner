import logging
import os

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