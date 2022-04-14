import logging

logger = logging.getLogger("DFK-DEX")

def printSeperator(newLine=False):
    line = ("------------------------------------------------------------------------------------------------------------------")

    logger.info(line)

    if newLine:
        print("\n")

def printRoundtrip(count):
    logger.info("##################################################################################################################")
    logger.info(f"STARTING ARBITRAGE #{count}")
    logger.info("##################################################################################################################")

    print("\n")