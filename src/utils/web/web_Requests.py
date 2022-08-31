from retry import retry
import requests

from src.utils.env.env_Docker import getAWSSecret
from src.utils.logging.logging_Setup import getProjectLogger
from src.utils.retry.retry_Params import getRetryParams

# Setup logging
logger = getProjectLogger()

# Retry Envs
httpRetryLimit, httpRetryDelay = getRetryParams(retryType="http")

@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def getAuthRawGithubFile(url):
    githubKey = getAWSSecret(key="GITHUB_KEY")
    return requests.get(url, headers={'Authorization': githubKey}).json()

@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def safeRequest(endpoint, params=None, headers=None):
    request = requests.get(endpoint, params=params, headers=headers)
    request.raise_for_status()
    return request.json()
