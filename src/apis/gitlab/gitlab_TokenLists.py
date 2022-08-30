from src.apis.gitlab.gitlab_Utils import buildGitlabAPIBaseURL, encodePath, getGitlabTokenHeader
from src.utils.web.web_Requests import safeRequest

gitlabAPIBaseURL = buildGitlabAPIBaseURL()
gitlabToken = getGitlabTokenHeader()

# Get Token List Urls
def getTokenListFromGitlab(path, branch="master"):
    unencodedPath = f"token-lists/{path}"
    encodedPath = encodePath(
        path=unencodedPath
    )
    endpoint = f"{gitlabAPIBaseURL}/{encodedPath}/raw?ref={branch}"
    return safeRequest(endpoint=endpoint, params=None, headers=gitlabToken)

# Get Token List Stored In Our Gitlab Repo
def getCommonTokenFilesFromGitlab(chainName, branch="master"):
    unencodedPath = f"token-lists/{chainName}/common/local/local.json"
    encodedPath = encodePath(
        path=unencodedPath
    )
    endpoint = f"{gitlabAPIBaseURL}/{encodedPath}/raw?ref={branch}"
    return safeRequest(endpoint=endpoint, params=None, headers=gitlabToken)["tokens"]