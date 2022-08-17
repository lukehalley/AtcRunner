import os, sys

# Get retry params for different sections of the project
from src.utils.env.env_AWSSecrets import checkIsDocker

def getRetryParams(retryType: str):

    isDocker = checkIsDocker()

    if isDocker:
        if retryType == "http":
            return int(os.environ.get("HTTP_RETRY_LIMIT")), int(os.environ.get("HTTP_RETRY_DELAY"))
        elif retryType == "transactionQuery":
            return int(os.environ.get("TRANSACTION_QUERY_RETRY_LIMIT")), int(os.environ.get("TRANSACTION_QUERY_RETRY_DELAY"))
        elif retryType == "transactionAction":
            return int(os.environ.get("TRANSACTION_ACTION_RETRY_LIMIT")), int(os.environ.get("TRANSACTION_ACTION_RETRY_DELAY"))
        else:
            sys.exit(f"Invalid Retry param type {retryType}")
    else:
        return 1, 0

# Get transaction timeout
def getTransactionTimeout():
    return int(os.environ.get("TRANSACTION_TIMEOUT_SECS"))