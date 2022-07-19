# Build the base of our API urls
import requests

from src.utils.general import getAWSSecret

def buildApiURL(baseUrl, endpoint):
    return f"{baseUrl}/{endpoint}"

def getAuthRawGithubFile(url):
    githubKey = getAWSSecret(key="GITHUB_KEY")
    return requests.get(url, headers={'Authorization': githubKey}).json()