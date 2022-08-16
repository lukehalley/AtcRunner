from src.tokenlist.tokenlist_Parse import parseDataframeResult

def getAllowedKeys():
    return ['chainId', 'address', 'symbol', 'name', 'decimals', 'logoURI']

def getTokenBySymbolAndChainID(tokenListDataframe, tokenSymbol, tokenChainId):
    result = tokenListDataframe.loc[(tokenListDataframe['symbol'] == tokenSymbol) & (tokenListDataframe['chainId'] == int(tokenChainId))]
    if len(result) > 0:
        resultDict = parseDataframeResult(result=result)
        return resultDict[0]
    if len(result) > 1:
        raise Exception(f"More than one token found for\nSymbol: {tokenSymbol}\nChain Id: {tokenChainId}")
    else:
        raise Exception(f"Couldn't find a token with\nSymbol: {tokenSymbol}\nChain Id: {tokenChainId}")

def getTokensBySymbol(tokenListDataframe, tokenSymbol):
    result = tokenListDataframe.loc[(tokenListDataframe['symbol'] == tokenSymbol)]
    if len(result) > 0:
        resultDict = parseDataframeResult(result=result)
        return resultDict
    else:
        raise Exception(f"Couldn't find token(s) with\nSymbol: {tokenSymbol}")

def getTokensByChainId(tokenListDataframe, tokenChainId):
    result = tokenListDataframe.loc[(tokenListDataframe['chainId'] == tokenChainId)]
    if len(result) > 0:
        resultDict = parseDataframeResult(result=result)
        return resultDict
    else:
        raise Exception(f"Couldn't find token(s) with\nChain Id: {tokenChainId}")

def getTokensByAddress(tokenListDataframe, tokenAddress):
    result = tokenListDataframe.loc[(tokenListDataframe['address'] == tokenAddress)]
    if len(result) > 0:
        resultDict = parseDataframeResult(result=result)
        return resultDict
    else:
        raise Exception(f"Couldn't find token(s) with\nToken Address: {tokenAddress}")