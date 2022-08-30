from src.apis.gitlab.gitlab_Utils import buildGitlabAPIBaseURL, encodePath, getGitlabTokenHeader
from src.utils.web.web_Requests import safeRequest

gitlabAPIBaseURL = buildGitlabAPIBaseURL()
gitlabToken = getGitlabTokenHeader()

# Get ABI File From Gitlab
def getBridgeMetadataFromGitlab(chainName, bridgeName, branch="master"):
    unencodedPath = f"bridges/{chainName}/{bridgeName}/bridge.json"
    encodedPath = encodePath(
        path=unencodedPath
    )
    endpoint = f"{gitlabAPIBaseURL}/{encodedPath}/raw?ref={branch}"
    return safeRequest(endpoint=endpoint, params=None, headers=gitlabToken)