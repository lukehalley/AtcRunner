from src.apis.gitlab.gitlab_Utils import buildGitlabAPIFilesURL, encodePath, getGitlabTokenHeader
from src.utils.web.web_Requests import safeRequest

gitlabAPIBaseFileURL = buildGitlabAPIFilesURL()
gitlabToken = getGitlabTokenHeader()

# Get Token List Urls
def getTokenListFromGitlab(path, branch="master"):
    unencodedPath = f"tokens/{path}"
    encodedPath = encodePath(
        path=unencodedPath
    )
    endpoint = f"{gitlabAPIBaseFileURL}/{encodedPath}/raw?ref={branch}"
    return safeRequest(endpoint=endpoint, params=None, headers=gitlabToken)

# Get Token List Stored In Our Gitlab Repo
def getCommonTokenFilesFromGitlab(chainName, branch="master"):
    unencodedPath = f"tokens/{chainName}/local.json"
    encodedPath = encodePath(
        path=unencodedPath
    )
    endpoint = f"{gitlabAPIBaseFileURL}/{encodedPath}/raw?ref={branch}"
    return safeRequest(endpoint=endpoint, params=None, headers=gitlabToken)["tokens"]