import logging
import os
import requests

def calculateArbitrage(arbTitle, networkOne, networkTwo):

    # Dex Screen Envs
    pairsEndpoint = os.environ.get("DEXSCREENER_API_ENDPOINT")

    # Network One
    networkOneEndpoint = f"{pairsEndpoint}/{networkOne['chain']}/{networkOne['tokenDexPair']}"
    networkOneResult = requests.get(networkOneEndpoint)
    networkOneResultJSON = networkOneResult.json()["pair"]
    networkOnePrice = float(networkOneResultJSON["priceUsd"])

    # Network Two
    networkTwoEndpoint = f"{pairsEndpoint}/{networkTwo['chain']}/{networkTwo['tokenDexPair']}"
    networkTwoResult = requests.get(networkTwoEndpoint)
    networkTwoResultJSON = networkTwoResult.json()["pair"]
    networkTwoPrice = float(networkTwoResultJSON["priceUsd"])

    # Calculate
    priceDifference = calculateDifference(networkOnePrice, networkTwoPrice)

    arbitrageOrigin, arbitrageDestination = calculateArbitrageStrategy(networkOnePrice, networkOne['chain'], networkTwoPrice, networkTwo['chain'])

    reportString = f"{arbTitle} - [{networkOne['readableChain']} @ ${networkOnePrice} vs {networkTwo['readableChain']} @ ${networkTwoPrice}] = [{priceDifference}% Arb]"

    return reportString, priceDifference, arbitrageOrigin, arbitrageDestination, networkOnePrice, networkTwoPrice

def calculateDifference(pairOne, pairTwo):
    return abs(round(((pairTwo - pairOne) * 100) / pairOne, 2))

def calculateArbitrageStrategy(n1Price, n1Name, n2Price, n2Name):
    if n1Price < n2Price:
        return n2Name, n1Name
    elif n2Price < n1Price:
        return n1Name, n2Name
    else:
        return None, None

def calculateQueryInterval(recipeCount):
    requestLimit = float(os.environ.get("REQUEST_LIMIT"))
    return 60 / (requestLimit / recipeCount)

def checkArbitragIsWorthIt(difference):
    # Dex Screen Envs
    threshold = float(os.environ.get("ARBITRAGE_THRESHOLD"))
    if difference >= threshold and difference > 0:
        return True
    else:
        return False

