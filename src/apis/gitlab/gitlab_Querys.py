from src.apis.gitlab.gitlab_Utils import buildGitlabAPIBaseURL, encodePath, getGitlabTokenHeader
from src.utils.web.web_Requests import safeRequest

gitlabAPIBaseURL = buildGitlabAPIBaseURL()
gitlabToken = getGitlabTokenHeader()

def getDexABIFromGitlab(chainName, dexName, abiName, branch="master"):
    unencodedPath = f"abis/{chainName}/{dexName}/{abiName}.json"
    encodedPath = encodePath(
        path=unencodedPath
    )
    endpoint = f"{gitlabAPIBaseURL}/{encodedPath}/raw?ref={branch}"
    return safeRequest(endpoint=endpoint, params=None, headers=gitlabToken)["abi"]

def getDexTokenListFromGitlab(chainName, dexName, branch="master"):
    unencodedPath = f"token-lists/{chainName}/{dexName}/dexTokenList.json"
    encodedPath = encodePath(
        path=unencodedPath
    )
    endpoint = f"{gitlabAPIBaseURL}/{encodedPath}/raw?ref={branch}"
    return safeRequest(endpoint=endpoint, params=None, headers=gitlabToken)["urls"]

def getChainTokenListFromGitlab(chainName, branch="master"):
    unencodedPath = f"token-lists/{chainName}/networkTokenList.json"
    encodedPath = encodePath(
        path=unencodedPath
    )
    endpoint = f"{gitlabAPIBaseURL}/{encodedPath}/raw?ref={branch}"
    return safeRequest(endpoint=endpoint, params=None, headers=gitlabToken)["urls"]