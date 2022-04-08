import logging
import sys

def setupLogging():
    log_format = '%(asctime)s | %(message)s'
    logger = logging.getLogger("DFK-ARB")
    logging.basicConfig(level=logging.INFO, format=log_format, stream=sys.stdout)

    return logger