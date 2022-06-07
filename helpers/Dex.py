import os

import requests
from dotenv import load_dotenv
from helpers import Utils
import logging
from web3 import Web3
logger = logging.getLogger("DFK-DEX")

load_dotenv()

dexscreenerAPIEndpoint = os.getenv("DEXSCREENER_API_ENDPOINT")
dexscreenerAPIVersion = os.getenv("DEXSCREENER_API_VERSION")
dexscreenerAPISection = os.getenv("DEXSCREENER_API_SECTION")
dexscreenerAPIBaseURL = dexscreenerAPIEndpoint + "/" + dexscreenerAPIVersion + "/" + dexscreenerAPISection

x = 1

def buildApiURL(endpoint):
    return f"{dexscreenerAPIBaseURL}/{endpoint}"

def getPairs(chain, tokenAddress):
    initEndpoint = buildApiURL(os.getenv("DEXSCREENER_GET_PAIRS"))
    params = {":chainId": chain, ":pairAddress": tokenAddress}
    endpoint = Utils.replace_all(initEndpoint, params)
    return (requests.get(endpoint, params=params)).json()

def getTokens(tokenAddress):
    initEndpoint = buildApiURL(os.getenv("DEXSCREENER_GET_TOKENS"))
    params = {":tokenAddress": tokenAddress}
    endpoint = Utils.replace_all(initEndpoint, params)

    return (requests.get(endpoint, params=params)).json()

def doSearch(query):
    initEndpoint = buildApiURL(os.getenv("DEXSCREENER_SEARCH_TOKENS"))
    params = {":query": query}
    endpoint = Utils.replace_all(initEndpoint, params)
    return (requests.get(endpoint, params=params)).json()

def searchReturnedResults(result):
    toSearch = result["pairs"]

    return toSearch

def getTokenPriceByDexId(chainName, tokenAddress, dexId):
    tokens = getTokens(tokenAddress)["pairs"]

    for token in tokens:
        if token["chainId"] == chainName and token["dexId"] == dexId:
            return float(token["priceUsd"])

def getTokenPrice(chainName, tokenAddress):
    tokens = getTokens(tokenAddress)["pairs"]

    for token in tokens:
        if token["chainId"] == chainName:
            return float(token["priceUsd"])

def getGasPrice(chainName, tokenAddress):
    tokens = getPairs(chain=chainName, tokenAddress=tokenAddress)["pairs"]

    for token in tokens:
        if token["chainId"] == chainName:
            return float(token["priceUsd"])