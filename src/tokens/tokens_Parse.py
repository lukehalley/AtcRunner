import pandas as pd

from src.apis.gitlab.gitlab_Querys import getFileFromGitlab
from src.tokens.tokens_Query import getAllowedKeys
from src.utils.web.web_Requests import getAuthRawGithubFile, safeRequest

allowedKeys = getAllowedKeys()

def parseTokenLists(tokenListURLs, chainId):
    finalTokenList = []

    for url in tokenListURLs:

        if "raw.githubusercontent" in url:
            singleTokenListJSON = getAuthRawGithubFile(url)["tokens"]
        elif "gitlab.com" in url:
            singleTokenListJSON = getFileFromGitlab(url)["tokens"]
        else:
            singleTokenListJSON = safeRequest(endpoint=url, params=None, headers=None)["tokens"]

        finalTokenList = finalTokenList + singleTokenListJSON

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

    return tokenListDataframe


def parseDataframeResult(result):
    results = []

    for index, row in result.iterrows():
        resultDict = {}
        for key in allowedKeys:
            resultDict[key] = row[key]
        results.append(resultDict)

    return results
