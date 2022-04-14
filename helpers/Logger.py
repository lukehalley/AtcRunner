import logging
import sys
import os
from dotenv import load_dotenv

def setupLogging():

    load_dotenv()

    logFile = os.environ.get("LOG_FILE")
    logFileMode = os.environ.get("LOG_FILE_MODE")

    log_format = '%(asctime)s | %(message)s'
    logger = logging.getLogger("DFK-ARB")
    logging.basicConfig(filename=logFile, filemode=logFileMode, level=logging.INFO, format=log_format, stream=sys.stdout)

    return logger