import os, urllib.parse

# Build the base of our API endpoint url
from src.utils.env.env_Docker import getAWSSecret

def buildGitlabAPIBaseURL():
    gitlabAPIEndpoint = os.getenv("GITLAB_BASE_URL")
    gitlabAPIVersion = os.getenv("GITLAB_API_VERSION")
    gitlabDataProject = os.getenv("GITLAB_DATA_PROJECT_ID")
    return f"{gitlabAPIEndpoint}/api/v{gitlabAPIVersion}/projects/{gitlabDataProject}/repository/files"

def getGitlabTokenHeader():
    return {
        'PRIVATE-TOKEN': getAWSSecret(key="GITLAB_KEY")
    }

def encodePath(path):
    return urllib.parse.quote(path, safe='')