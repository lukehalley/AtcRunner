import logging
import sys
import os
from dotenv import load_dotenv

def setupLogging(isDocker):

    log_format = '%(asctime)s | %(message)s'
    logger = logging.getLogger("DFK-ARB")

    if isDocker:
        load_dotenv()
        logFile = os.environ.get("LOG_FILE")
        logFileMode = os.environ.get("LOG_FILE_MODE")
        logging.basicConfig(filename=logFile, filemode=logFileMode, level=logging.INFO, format=log_format)
    else:
        logging.basicConfig(level=logging.INFO, format=log_format, stream=sys.stdout)

    return logger