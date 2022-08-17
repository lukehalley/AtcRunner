import os, sys

# Get retry params for different sections of the project
def getRetryParams(retryType: str):
    if type == "http":
        return int(os.environ.get("HTTP_RETRY_LIMIT")), int(os.environ.get("HTTP_RETRY_DELAY"))
    elif type == "transactionQuery":
        return int(os.environ.get("TRANSACTION_QUERY_RETRY_LIMIT")), int(os.environ.get("TRANSACTION_QUERY_RETRY_DELAY"))
    elif type == "transactionAction":
        return int(os.environ.get("TRANSACTION_ACTION_RETRY_LIMIT")), int(os.environ.get("TRANSACTION_ACTION_RETRY_DELAY")), int(os.environ.get("TRANSACTION_TIMEOUT_SECS"))
    else:
        sys.exit(f"Invalid Retry param type {retryType}")