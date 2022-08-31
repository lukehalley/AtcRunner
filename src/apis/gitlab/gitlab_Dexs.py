from src.apis.gitlab.gitlab_Utils import encodePath, getGitlabTokenHeader, buildGitlabAPITreeURL, buildGitlabAPIFilesURL
from src.utils.web.web_Requests import safeRequest

gitlabAPIBaseFileURL = buildGitlabAPIFilesURL()
gitlabAPIBaseTreeURL = buildGitlabAPITreeURL()
gitlabToken = getGitlabTokenHeader()

# Get ABI File From Gitlab
def getDexsMetadataForChainFromGitlab(chainName, branch="master"):

    unencodedPath = f"dexs/{chainName}"
    encodedPath = encodePath(
        path=unencodedPath
    )
    endpoint = f"{gitlabAPIBaseTreeURL}?path={encodedPath}"
    dexTree = safeRequest(endpoint=endpoint, params=None, headers=gitlabToken)

    chainDexs = {}

    for dexDirectory in dexTree:
        dexPath = dexDirectory["path"]
        dexName = dexDirectory["name"]
        unencodedPath = f"{dexPath}/dex.json"
        encodedPath = encodePath(
            path=unencodedPath
        )
        endpoint = f"{gitlabAPIBaseFileURL}/{encodedPath}/raw?ref={branch}"
        chainDexs[dexName] = safeRequest(endpoint=endpoint, params=None, headers=gitlabToken)

    return chainDexs