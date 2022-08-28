from src.apis.gitlab.gitlab_Utils import buildGitlabAPIBaseURL, encodePath, getGitlabTokenHeader
from src.utils.web.web_Requests import safeRequest

gitlabAPIBaseURL = buildGitlabAPIBaseURL()
gitlabToken = getGitlabTokenHeader()

def getDexABIFromGitlab(chainName, dexName, abiName, abiBranch="master"):
    unencodedPath = f"abis/{chainName}/{dexName}/{abiName}.json"
    encodedPath = encodePath(
        path=unencodedPath
    )
    endpoint = f"{gitlabAPIBaseURL}/{encodedPath}/raw?ref={abiBranch}"
    return safeRequest(endpoint=endpoint, params=None, headers=gitlabToken)["abi"]
