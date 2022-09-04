def getAllowedKeys():
    return ['chainId', 'address', 'symbol', 'name', 'decimals', 'logoURI']


def getTokenBySymbolAndChainID(tokenList, tokenSymbol, tokenChainId):

    result = [item for item in tokenList if item["symbol"] == tokenSymbol and item["chainId"] == int(tokenChainId)]
    resultsAmount = len(result)

    if resultsAmount == 1:
        return result[0]
    elif resultsAmount > 1:
        raise Exception(f"More than one token found for\nSymbol: {tokenSymbol}\nChain Id: {tokenChainId}")
    else:
        raise Exception(f"Couldn't find a token with\nSymbol: {tokenSymbol}\nChain Id: {tokenChainId}")


def getTokensBySymbol(tokenList, tokenSymbol):

    result = [item for item in tokenList if item["symbol"] == tokenSymbol]
    resultsAmount = len(result)

    if resultsAmount == 1:
        return result[0]
    elif resultsAmount > 1:
        raise Exception(f"More than one token found for\nSymbol: {tokenSymbol}")
    else:
        raise Exception(f"Couldn't find a token with\nSymbol: {tokenSymbol}")


def getTokensByChainId(tokenList, tokenChainId):

    result = [item for item in tokenList if item["chainId"] == tokenChainId]
    resultsAmount = len(result)

    if resultsAmount == 1:
        return result[0]
    elif resultsAmount > 1:
        raise Exception(f"More than one token found for\nChain Id: {tokenChainId}")
    else:
        raise Exception(f"Couldn't find a token with\nChain Id: {tokenChainId}")


def getTokensByAddress(tokenList, tokenAddress):
    result = [item for item in tokenList if item["address"] == tokenAddress]
    resultsAmount = len(result)

    if resultsAmount == 1:
        return result[0]
    elif resultsAmount > 1:
        raise Exception(f"More than one token found for\nToken Address: {tokenAddress}")
    else:
        raise Exception(f"Couldn't find a token with\nToken Address: {tokenAddress}")
