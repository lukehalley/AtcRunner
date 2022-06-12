import os, requests, logging
from src.utils.api import buildApiURL
from src.utils.general import replace_all

# Setup logging
logger = logging.getLogger("DFK-DEX")

# Build the base of our API endpoint url
dexscreenerAPIEndpoint = os.getenv("DEXSCREENER_API_ENDPOINT")
dexscreenerAPIVersion = os.getenv("DEXSCREENER_API_VERSION")
dexscreenerAPISection = os.getenv("DEXSCREENER_API_SECTION")
dexscreenerAPIBaseURL = dexscreenerAPIEndpoint + "/" + dexscreenerAPIVersion + "/" + dexscreenerAPISection

# Get token pairs from Dexscreener
def getPairs(chain, tokenAddress):
    initEndpoint = buildApiURL(baseUrl=dexscreenerAPIBaseURL, endpoint=os.getenv("DEXSCREENER_GET_PAIRS"))
    params = {":chainId": chain, ":pairAddress": tokenAddress}
    endpoint = replace_all(initEndpoint, params)
    return (requests.get(endpoint, params=params)).json()

# Get token(s) from Dexscreener
def getTokens(tokenAddress):
    initEndpoint = buildApiURL(baseUrl=dexscreenerAPIBaseURL, endpoint=os.getenv("DEXSCREENER_GET_TOKENS"))
    params = {":tokenAddress": tokenAddress}
    endpoint = replace_all(initEndpoint, params)

    return (requests.get(endpoint, params=params)).json()

# Do a query against the Dexscreener API
def doSearch(query):
    initEndpoint = buildApiURL(baseUrl=dexscreenerAPIBaseURL, endpoint=os.getenv("DEXSCREENER_SEARCH_TOKENS"))
    params = {":query": query}
    endpoint = replace_all(initEndpoint, params)
    return (requests.get(endpoint, params=params)).json()

# Get the token price by Dex id
def getTokenPriceByDexId(chainName, tokenAddress, dexId):
    tokens = getTokens(tokenAddress)["pairs"]

    for token in tokens:
        if token["chainId"] == chainName and token["dexId"] == dexId:
            return float(token["priceUsd"])

# Get the price of one token by its address
def getTokenPrice(chainName, tokenAddress):
    tokens = getTokens(tokenAddress)["pairs"]

    for token in tokens:
        if token["chainId"] == chainName:
            return float(token["priceUsd"])

# Get the price of gas for a chain
def getGasPrice(chainName, tokenAddress):
    tokens = getPairs(chain=chainName, tokenAddress=tokenAddress)["pairs"]

    for token in tokens:
        if token["chainId"] == chainName:
            return float(token["priceUsd"])
