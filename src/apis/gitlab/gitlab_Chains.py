from src.apis.gitlab.gitlab_Utils import buildGitlabAPIFilesURL, encodePath, getGitlabTokenHeader
from src.utils.web.web_Requests import safeRequest

gitlabAPIBaseFileURL = buildGitlabAPIFilesURL()
gitlabToken = getGitlabTokenHeader()

# Get ABI File From Gitlab
def getChainMetadataFromGitlab(chainName, branch="master"):
    unencodedPath = f"chains/{chainName}/chain.json"
    encodedPath = encodePath(
        path=unencodedPath
    )
    endpoint = f"{gitlabAPIBaseFileURL}/{encodedPath}/raw?ref={branch}"
    result = safeRequest(endpoint=endpoint, params=None, headers=gitlabToken)
    return result