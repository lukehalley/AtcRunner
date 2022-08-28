from src.apis.gitlab.gitlab_Utils import buildGitlabAPIBaseURL, encodePath, getGitlabTokenHeader
from src.utils.web.web_Requests import safeRequest

gitlabAPIBaseURL = buildGitlabAPIBaseURL()
gitlabToken = getGitlabTokenHeader()

# Get Files

def getFileFromGitlab(url):
    return safeRequest(endpoint=url, params=None, headers=gitlabToken)

def getDexABIFileFromGitlab(chainName, dexName, abiName, branch="master"):
    unencodedPath = f"abis/{chainName}/{dexName}/{abiName}.json"
    encodedPath = encodePath(
        path=unencodedPath
    )
    endpoint = f"{gitlabAPIBaseURL}/{encodedPath}/raw?ref={branch}"
    return safeRequest(endpoint=endpoint, params=None, headers=gitlabToken)["abi"]

def getTokenListFileFromGitlab(chainName, branch="master"):
    unencodedPath = f"token-lists/{chainName}/common/local/local.json"
    encodedPath = encodePath(
        path=unencodedPath
    )
    endpoint = f"{gitlabAPIBaseURL}/{encodedPath}/raw?ref={branch}"
    return endpoint

# Get URL Lists

def getTokenListURLsFromGitlab(path, branch="master"):
    # unencodedPath = f"token-lists/{chainName}/{dexName}/external/external.json"
    unencodedPath = f"token-lists/{path}"
    encodedPath = encodePath(
        path=unencodedPath
    )
    endpoint = f"{gitlabAPIBaseURL}/{encodedPath}/raw?ref={branch}"
    return safeRequest(endpoint=endpoint, params=None, headers=gitlabToken)["urls"]

def getChainTokenListURLsFromGitlab(chainName, branch="master"):
    unencodedPath = f"token-lists/{chainName}/common/external/external.json"
    encodedPath = encodePath(
        path=unencodedPath
    )
    endpoint = f"{gitlabAPIBaseURL}/{encodedPath}/raw?ref={branch}"
    return safeRequest(endpoint=endpoint, params=None, headers=gitlabToken)["urls"]