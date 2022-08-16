import os
from decimal import Decimal

from src.apis.dexScreener.dexScreener_Utils import buildDexscreenerAPIBaseURL
from src.utils.web.web_Requests import buildApiURL, safeRequest
from src.utils.files.files_Directory import replace_all

dexscreenerAPIBaseURL = buildDexscreenerAPIBaseURL()

# Get token pairs from Dexscreener
def getPairs(chain: int, tokenAddress: str):
    initEndpoint = buildApiURL(baseUrl=dexscreenerAPIBaseURL, endpoint=os.getenv("DEXSCREENER_GET_PAIRS"))
    params = {":chainId": chain, ":pairAddress": tokenAddress}
    endpoint = replace_all(initEndpoint, params)
    return safeRequest(endpoint, params)

# Get token(s) from Dexscreener
def getTokens(tokenAddress: str):
    initEndpoint = buildApiURL(baseUrl=dexscreenerAPIBaseURL, endpoint=os.getenv("DEXSCREENER_GET_TOKENS"))
    params = {":tokenAddress": tokenAddress}
    endpoint = replace_all(initEndpoint, params)
    return safeRequest(endpoint, params)

# Do a query against the Dexscreener API
def getTokensByQuery(query: str):
    initEndpoint = buildApiURL(baseUrl=dexscreenerAPIBaseURL, endpoint=os.getenv("DEXSCREENER_SEARCH_TOKENS"))
    params = {":query": query}
    endpoint = replace_all(initEndpoint, params)
    return safeRequest(endpoint, params)["pairs"]

# Get the token price by Dex id
def getTokenPriceByDexId(chainName: str, tokenAddress: str, dexName: str):
    tokens = getTokens(tokenAddress)["pairs"]

    for token in tokens:
        if token["chainId"] == chainName and token["dexName"] == dexName:
            return Decimal(token["priceUsd"])

# Get the price of one token by its address
def getTokenPrice(chainName: str, tokenAddress: str):
    tokens = getTokens(tokenAddress)["pairs"]

    for token in tokens:
        if token["chainId"] == chainName:
            return Decimal(token["priceUsd"])

# Get token address by tokenlist symbol and dex name
def getTokenAddressByDexId(query: str, dexName: str):
    tokens = getTokensByQuery(query)

    for token in tokens:
        if token["dexName"] == dexName and token["baseToken"]["symbol"] == query:
            return token["baseToken"]["address"]