import sys
import urllib.request, json
import pandas as pd

from src.utils.api import getAuthRawGithubFile

allowedKeys = ['chainId', 'address', 'symbol', 'name', 'decimals', 'logoURI']

def parseTokenLists(urls):
    finalTokenList = []

    for url in urls:
        try:
            singleTokenListJSON = getAuthRawGithubFile(url)["tokens"]
        except:
            x = 1
        finalTokenList = finalTokenList + singleTokenListJSON
    allKeys = list(set().union(*(d.keys() for d in finalTokenList)))
    keysToRemove = list(set(allKeys) - set(allowedKeys))
    for key in keysToRemove:
        for dict in finalTokenList:
            if key in dict:
                del dict[key]
    return pd.DataFrame(finalTokenList).drop_duplicates(subset='address').sort_values('chainId')

def parseDataframeResult(result):
    results = []

    for index, row in result.iterrows():
        resultDict = {}
        for key in allowedKeys:
            resultDict[key] = row[key]
        results.append(resultDict)

    return results

def getTokenBySymbolAndChainID(tokenListDataframe, tokenSymbol, tokenChainId):
    result = tokenListDataframe.loc[(tokenListDataframe['symbol'] == tokenSymbol) & (tokenListDataframe['chainId'] == int(tokenChainId))]
    if len(result) > 0:
        resultDict = parseDataframeResult(result=result)
        return resultDict[0]
    if len(result) > 1:
        sys.exit(f"More than one token found for\nSymbol: {tokenSymbol}\nChain Id: {tokenChainId}")
    else:
        sys.exit(f"Couldn't find a token with\nSymbol: {tokenSymbol}\nChain Id: {tokenChainId}")

def getTokensBySymbol(tokenListDataframe, tokenSymbol):
    result = tokenListDataframe.loc[(tokenListDataframe['symbol'] == tokenSymbol)]
    if len(result) > 0:
        resultDict = parseDataframeResult(result=result)
        return resultDict
    else:
        sys.exit(f"Couldn't find token(s) with\nSymbol: {tokenSymbol}")

def getTokensByChainId(tokenListDataframe, tokenChainId):
    result = tokenListDataframe.loc[(tokenListDataframe['chainId'] == tokenChainId)]
    if len(result) > 0:
        resultDict = parseDataframeResult(result=result)
        return resultDict
    else:
        sys.exit(f"Couldn't find token(s) with\nChain Id: {tokenChainId}")

def getTokensByAddress(tokenListDataframe, tokenAddress):
    result = tokenListDataframe.loc[(tokenListDataframe['address'] == tokenAddress)]
    if len(result) > 0:
        resultDict = parseDataframeResult(result=result)
        return resultDict
    else:
        sys.exit(f"Couldn't find token(s) with\nToken Address: {tokenAddress}")

# tokenLists = [
#     "https://raw.githubusercontent.com/DefiKingdoms/community-token-list/main/build/defikingdoms-community.tokenlist.json",
#     "https://raw.githubusercontent.com/DefiKingdoms/community-token-list/main/src/defikingdoms-default.tokenlist.json",
#     "https://raw.githubusercontent.com/itslhk/token-lists/main/build/tradescrow-all.tokenlist.json"
# ]
#
# tokenListDataframe = parseTokenLists(urls=tokenLists)
# tokenDetails = getTokenBySymbolAndChainID(tokenListDataframe=tokenListDataframe, tokenSymbol="USDC", tokenChainId=53935)
# x = getTokensByChainId(tokenListDataframe=tokenListDataframe, tokenChainId=53935)
# y = getTokensBySymbol(tokenListDataframe=tokenListDataframe, tokenSymbol="USDC")
# z = getTokensByAddress(tokenListDataframe=tokenListDataframe, tokenAddress='0x3AD9DFE640E1A9Cc1D9B0948620820D975c3803a')
#
# x = 1