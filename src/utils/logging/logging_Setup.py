import logging, os, sys

from src.utils.files.files_Directory import strToBool

# Set up logging
def setupLogging(isDocker):

    logger = logging.getLogger("DFK-ARB")

    log_format = '%(asctime)s | %(levelname)s | %(message)s'
    dateFormat = os.environ.get("DATE_FORMAT")

    logEnabled = strToBool(os.getenv("ENABLE_FILE_LOG"))

    if isDocker and logEnabled:
        logFile = os.environ.get("LOG_FILE")
        logFileMode = os.environ.get("LOG_FILE_MODE")
        logging.basicConfig(filename=logFile, filemode=logFileMode, level=logging.INFO,
                            format=log_format, datefmt=dateFormat)
    else:
        logging.basicConfig(level=logging.INFO, format=log_format,
                            stream=sys.stdout, datefmt=dateFormat)

    return logger

# Get the project logger
def getProjectLogger():
    return logging.getLogger("DFK-DEX")