# Build the base of our API urls
import requests

from src.utils.general import getAWSSecret

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