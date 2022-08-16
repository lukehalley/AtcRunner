import logging
import os, requests
from retry import retry

from src.utils.general import getAWSSecret

# Setup logging
logger = logging.getLogger("DFK-DEX")

# Retry Envs
httpRetryLimit = int(os.environ.get("HTTP_RETRY_LIMIT"))
httpRetryDelay = int(os.environ.get("HTTP_RETRY_DELAY"))

def buildApiURL(baseUrl, endpoint):
    return f"{baseUrl}/{endpoint}"

def getAuthRawGithubFile(url):
    githubKey = getAWSSecret(key="GITHUB_KEY")
    return requests.get(url, headers={'Authorization': githubKey}).json()

def safeRequest(endpoint, params):
    request = requests.get(endpoint, params=params)
    if request.ok:
        return request.json()
    else:
        endpoint = endpoint.split('/')[-1]
        raise Exception(f"{endpoint} returned status {request.status_code}: {request.json()['error']}")

@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def safeRequest(endpoint, params):
    try:
        request = requests.get(endpoint, params=params)
        request.raise_for_status()
    except requests.exceptions.RequestException as e:
        error = f"Error calling {endpoint} API endpoint: {e}"
        raise SystemExit(error)
    else:
        return request.json()