import os, sys

# Get retry params for different sections of the project
def getRetryParams(retryType: str):

    if type == "http":
        # Get the setting envs for the retry events
        httpRetryLimit = int(os.environ.get("HTTP_RETRY_LIMIT"))
        httpRetryDelay = int(os.environ.get("HTTP_RETRY_DELAY"))

        return httpRetryLimit, httpRetryDelay

    else:

        sys.exit(f"Invalid Retry param type {retryType}")