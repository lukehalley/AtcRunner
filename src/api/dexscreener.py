import logging
import os
import requests
from decimal import Decimal

from retry import retry

from src.utils.api import buildApiURL
from src.utils.general import replace_all

# Setup logging
logger = logging.getLogger("DFK-DEX")

# Build the base of our API endpoint url
dexscreenerAPIEndpoint = os.getenv("DEXSCREENER_API_ENDPOINT")
dexscreenerAPIVersion = os.getenv("DEXSCREENER_API_VERSION")
dexscreenerAPISection = os.getenv("DEXSCREENER_API_SECTION")
dexscreenerAPIBaseURL = dexscreenerAPIEndpoint + "/" + dexscreenerAPIVersion + "/" + dexscreenerAPISection

# Retry Envs
httpRetryLimit = int(os.environ.get("HTTP_RETRY_LIMIT"))
httpRetryDelay = int(os.environ.get("HTTP_RETRY_DELAY"))

@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def safeRequest(endpoint, params):
    try:
        request = requests.get(endpoint, params=params)
        request.raise_for_status()
    except requests.exceptions.RequestException as e:
        error = f"Error calling Dexscreener {endpoint} API endpoint: {e}"
        raise SystemExit(error)
    else:
        return request.json()

# Get token pairs from Dexscreener
def getPairs(chain, tokenAddress):
    initEndpoint = buildApiURL(baseUrl=dexscreenerAPIBaseURL, endpoint=os.getenv("DEXSCREENER_GET_PAIRS"))
    params = {":chainId": chain, ":pairAddress": tokenAddress}
    endpoint = replace_all(initEndpoint, params)
    return safeRequest(endpoint, params)

# Get token(s) from Dexscreener
def getTokens(tokenAddress):
    initEndpoint = buildApiURL(baseUrl=dexscreenerAPIBaseURL, endpoint=os.getenv("DEXSCREENER_GET_TOKENS"))
    params = {":tokenAddress": tokenAddress}
    endpoint = replace_all(initEndpoint, params)
    return safeRequest(endpoint, params)

# Do a query against the Dexscreener API
def doSearch(query):
    initEndpoint = buildApiURL(baseUrl=dexscreenerAPIBaseURL, endpoint=os.getenv("DEXSCREENER_SEARCH_TOKENS"))
    params = {":query": query}
    endpoint = replace_all(initEndpoint, params)
    return safeRequest(endpoint, params)["pairs"]

# Get the token price by Dex id
def getTokenPriceByDexId(chainName, tokenAddress, dexId):
    tokens = getTokens(tokenAddress)["pairs"]

    for token in tokens:
        if token["chainId"] == chainName and token["dexId"] == dexId:
            return Decimal(token["priceUsd"])

# Get the price of one token by its address
def getTokenPrice(chainName, tokenAddress):
    tokens = getTokens(tokenAddress)["pairs"]

    for token in tokens:
        if token["chainId"] == chainName:
            return Decimal(token["priceUsd"])

def getTokenAddressByDexId(query, dexId):
    tokens = doSearch(query)

    for token in tokens:
        if token["dexId"] == dexId and token["baseToken"]["symbol"] == query:
            return token["baseToken"]["address"]