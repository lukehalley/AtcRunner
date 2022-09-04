import pandas as pd
from web3 import Web3

from src.apis.gitlab.gitlab_TokenLists import getCommonTokenFilesFromGitlab
from src.tokens.tokens_Query import getAllowedKeys
from src.utils.chain.chain_Wei import getSupportedWei
from src.utils.web.web_Requests import getAuthRawGithubFile, safeRequest

allowedKeys = getAllowedKeys()

def parseTokenLists(tokenListURLs, chainId, chainName, chainGasToken):
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



    # Drop Tokens Which Is On Current Chain
    tokenListDataframe.drop(
        tokenListDataframe[
            tokenListDataframe['chainId'] != int(chainId)

        ].index, inplace=True
    )

    # Only Keep Tokens That Have Supported Certain Decimal Places
    supportedWei = getSupportedWei()
    tokenListDataframe = tokenListDataframe[tokenListDataframe['decimals'].isin(supportedWei)]

    tokenListDictionary = tokenListDataframe.to_dict('records')

    for token in tokenListDictionary:

        safeTokenAddress = Web3.toChecksumAddress(token["address"])

        if safeTokenAddress == chainGasToken:
            token["isGas"] = True
        else:
            token["isGas"] = False

    return tokenListDictionary
