import logging
import sys
import os
from dotenv import load_dotenv

def setupLogging(isDocker):

    logger = logging.getLogger("DFK-ARB")

    log_format = '%(asctime)s | %(levelname)s | %(message)s'
    dateFormat = os.environ.get("DATE_FORMAT")

    if isDocker:
        load_dotenv()
        logFile = os.environ.get("LOG_FILE")
        logFileMode = os.environ.get("LOG_FILE_MODE")
        logging.basicConfig(filename=logFile, filemode=logFileMode, level=logging.INFO,
                            format=log_format, datefmt=dateFormat)
    else:
        logging.basicConfig(level=logging.INFO, format=log_format,
                            stream=sys.stdout, datefmt=dateFormat)

    return logger