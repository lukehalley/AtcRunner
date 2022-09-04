import pandas as pd

from src.apis.gitlab.gitlab_TokenLists import getCommonTokenFilesFromGitlab
from src.tokens.tokens_Query import getAllowedKeys
from src.utils.web.web_Requests import getAuthRawGithubFile, safeRequest

allowedKeys = getAllowedKeys()

def parseTokenLists(tokenListURLs, chainId, chainName):
    finalTokenList = []

    for url in tokenListURLs:

        if "raw.githubusercontent" in url:
            singleTokenListJSON = getAuthRawGithubFile(url)["tokens"]
        else:
            singleTokenListJSON = safeRequest(endpoint=url, params=None, headers=None)["tokens"]

        finalTokenList = finalTokenList + singleTokenListJSON

    localChainCommonTokens = getCommonTokenFilesFromGitlab(
        chainName=chainName
    )

    finalTokenList = finalTokenList + localChainCommonTokens

    allKeys = list(set().union(*(d.keys() for d in finalTokenList)))
    keysToRemove = list(set(allKeys) - set(allowedKeys))

    for key in keysToRemove:
        for dict in finalTokenList:
            if key in dict:
                del dict[key]

    tokenListDataframe = pd.DataFrame(finalTokenList).drop_duplicates(
        subset=['chainId', 'symbol'],
        keep='last').sort_values('chainId')

    tokenListDataframe.drop(
        tokenListDataframe[tokenListDataframe['chainId'] != int(chainId)].index, inplace=True
    )

    tokenListDictionary = tokenListDataframe.to_dict('records')

    return tokenListDictionary


def parseDataframeResult(result):
    results = []

    for index, row in result.iterrows():
        resultDict = {}
        for key in allowedKeys:
            resultDict[key] = row[key]
        results.append(resultDict)

    return results
