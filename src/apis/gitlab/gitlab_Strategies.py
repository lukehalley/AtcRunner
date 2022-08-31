from src.apis.gitlab.gitlab_Utils import buildGitlabAPIFilesURL, encodePath, getGitlabTokenHeader
from src.utils.web.web_Requests import safeRequest

gitlabAPIBaseFileURL = buildGitlabAPIFilesURL()
gitlabToken = getGitlabTokenHeader()

# Get ABI File From Gitlab
def getStrategiesFromGitlab(recipeType, branch="master"):

    # Arbitrage Strategy
    arbitrageStrategyPath = f"strategies/{recipeType}/arbitrage.json"
    encodedArbitrageStrategyPath = encodePath(
        path=arbitrageStrategyPath
    )
    arbitrageStrategyEndpoint = f"{gitlabAPIBaseFileURL}/{encodedArbitrageStrategyPath}/raw?ref={branch}"
    arbitrageStrategy = safeRequest(endpoint=arbitrageStrategyEndpoint, params=None, headers=gitlabToken)

    # Rollback Strategy
    rollbackStrategyPath = f"strategies/{recipeType}/rollback.json"
    encodedRollbackStrategyPath = encodePath(
        path=rollbackStrategyPath
    )
    rollbackStrategyEndpoint = f"{gitlabAPIBaseFileURL}/{encodedRollbackStrategyPath}/raw?ref={branch}"
    rollbackStrategy = safeRequest(endpoint=rollbackStrategyEndpoint, params=None, headers=gitlabToken)

    strategies = {
        "arbitrage": arbitrageStrategy,
        "rollback": rollbackStrategy
    }

    return strategies