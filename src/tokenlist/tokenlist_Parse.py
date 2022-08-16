import pandas as pd
import simplejson as json

from src.tokenlist.tokenlist_Query import getAllowedKeys
from src.utils.web.web_Requests import getAuthRawGithubFile

allowedKeys = getAllowedKeys()

def parseTokenLists(urls):
    finalTokenList = []

    for url in urls:
        singleTokenListJSON = getAuthRawGithubFile(url)["tokenlist"]
        finalTokenList = finalTokenList + singleTokenListJSON

    allKeys = list(set().union(*(d.keys() for d in finalTokenList)))
    keysToRemove = list(set(allKeys) - set(allowedKeys))


    for key in keysToRemove:
        for dict in finalTokenList:
            if key in dict:
                del dict[key]

    tokenListDataframe = pd.DataFrame(finalTokenList).drop_duplicates(subset=['chainId', 'symbol'], keep='last').sort_values('chainId')

    with open(f'data/cache/masterTokenList.json', 'w') as cacheFile:
        json.dump(tokenListDataframe.to_dict('records'), cacheFile, indent=4, use_decimal=True)

    return tokenListDataframe

def parseDataframeResult(result):
    results = []

    for index, row in result.iterrows():
        resultDict = {}
        for key in allowedKeys:
            resultDict[key] = row[key]
        results.append(resultDict)

    return results