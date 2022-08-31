from src.apis.gitlab.gitlab_Utils import buildGitlabAPIFilesURL, encodePath, getGitlabTokenHeader
from src.utils.web.web_Requests import safeRequest

gitlabAPIBaseFileURL = buildGitlabAPIFilesURL()
gitlabToken = getGitlabTokenHeader()

# Get ABI File From Gitlab
def getDexABIFileFromGitlab(chainName, dexName, abiName, branch="master"):
    unencodedPath = f"abis/{chainName}/{dexName}/{abiName}.json"
    encodedPath = encodePath(
        path=unencodedPath
    )
    endpoint = f"{gitlabAPIBaseFileURL}/{encodedPath}/raw?ref={branch}"
    return safeRequest(endpoint=endpoint, params=None, headers=gitlabToken)