from copy import deepcopy
from json import JSONDecodeError
from pathlib import Path

from dotenv import load_dotenv
load_dotenv()

from src.api.synapsebridge import getBridgeableTokens
from src.utils.general import getDictLength, getProjectRoot, printSeperator
import urllib.request, os
import simplejson as json
from src.wallet.queries.swap import getSwapQuoteOut
from collections import OrderedDict
from operator import getitem

root = getProjectRoot().parent

chainIdsToIgnore = [1]

synapseAllBridgeabletokens = {}
chainsDetails = {}

useCache = True

def getAllBridgeableTokensFromURL(chainsURL="https://chainid.network/chains.json"):
    bridgeableTokens = []

    with urllib.request.urlopen(chainsURL) as url:
        evmChains = json.loads(url.read().decode())

    # Filter out testnet chains and get bridgeable tokens
    for chain in evmChains:

        if chain["chainId"] not in chainIdsToIgnore:

            filterStrings = ["test"]

            hasFilterStrings = False
            for filterString in filterStrings:
                hasFilterString = any(filterString in (str(v)).lower() for v in chain.values())

                if hasFilterString:
                    hasFilterStrings = True
                    break

            if not hasFilterStrings:
                output = getBridgeableTokens(chain=chain["chainId"])
                if "error" not in output:
                    chainsDetails[chain["chainId"]] = chain
                    bridgeableTokens.append(output)

    bridgeableTokens.sort(key=getDictLength, reverse=True)

    for currentDictList in bridgeableTokens:
        for result in currentDictList:

            filterStrings = []
            hasFilterStrings = False
            for filterString in filterStrings:
                hasFilterString = any(filterString in (str(v)).lower() for v in result.values())

                if hasFilterString:
                    hasFilterStrings = True
                    break

            if not hasFilterStrings:
                currentName = result["name"]
                if currentName not in synapseAllBridgeabletokens:
                    synapseAllBridgeabletokens[currentName] = result
                else:
                    synapseAllBridgeabletokens[currentName] = synapseAllBridgeabletokens[currentName] | result

    return synapseAllBridgeabletokens, chainsDetails

def getTokenByChain(allChainIds, chainsDetails):
    bridgeableTokensByChain = {}
    for chainId in allChainIds:

        chainTokens = []

        if chainId not in bridgeableTokensByChain.keys():
            bridgeableTokensByChain[chainId] = {}
        else:
            x = 1

        for key, value in synapseAllBridgeabletokens.items():

            details = deepcopy(value)

            if str(chainId) in details["addresses"].keys():
                details["address"] = details["addresses"][str(chainId)]
                siblingChains = list(details["addresses"].keys())
                siblingChains.remove(str(chainId))
                details["siblingChains"] = list(map(int, siblingChains))

            if str(chainId) in details["decimals"].keys():
                details["decimal"] = details["decimals"][str(chainId)]

            if str(chainId) in details["wrapperAddresses"].keys():
                details["wrapperAddress"] = details["wrapperAddresses"][str(chainId)]

            if "address" in details or "decimal" in details or "wrapperAddress" in details:
                chainTokens.append(details)

        if len(chainTokens) > 0:
            # Add network tokens
            bridgeableTokensByChain[chainId]["tokens"] = chainTokens

            # Add network info
            bridgeableTokensByChain[chainId]["chain"] = chainsDetails[chainId]

            if str(chainId) in chainsDetails:
                bridgeableTokensByChain[chainId]["dexs"] = chainsDetails[str(chainId)]
    return bridgeableTokensByChain

def getChainsFromLocal():
    return os.path.join(root, "data", "misc", "openXswap-misc", "Chains", "Chains.json")

def getDexsFromLocal():
    return os.path.join(root, "data", "misc", "openXswap-misc", "Projects")

def getDexsFromLocal():
    dexs = {}
    chainDexsDictJSON = os.path.join(root, "data", "misc", "openXswap-misc", "Projects")
    for path in Path(chainDexsDictJSON).rglob('*.json'):
        try:
            currentJSON = json.load(open(path))
            dexs = dexs | currentJSON
        except JSONDecodeError:
            pass
    return dexs

def getAllChainIds(bridgeableTokens):
    allChainIds = []
    for key, value in bridgeableTokens.items():
        chainIds = value["addresses"]
        for chainId in chainIds:
            if int(chainId) not in allChainIds and int(chainId) not in chainIdsToIgnore:
                allChainIds.append(int(chainId))
    allChainIds.sort()
    return allChainIds

def getPricesForAllTokensOnAllDexs(bridgeableTokens, bridgeableDexs):
    tokenPrices = {}
    for tokenName, tokenProps in bridgeableTokens.items():

        tokenPrices[tokenProps['name']] = {}

        prices = []

        for tokenChain in allChainIds:

            tokenChain = str(tokenChain)

            currentChainDetails = chainsDetails[tokenChain]

            printSeperator()

            if tokenChain in bridgeableDexs:

                for dex in bridgeableDexs[tokenChain]:

                    try:
                        price = getSwapQuoteOut(
                            amountInNormal=1.0,
                            amountInDecimals=tokenProps["decimals"][tokenChain],
                            amountOutDecimals=stablecoinDetails["decimals"][tokenChain],
                            rpcUrl=currentChainDetails["rpc"][0],
                            routerAddress=dex["router"],
                            routes=[tokenProps["addresses"][tokenChain], stablecoinDetails["addresses"][tokenChain]]
                        )

                        priceObject = {
                            "dexName": dex["name"],
                            "tokenPrice": price,
                            "tokenAddress": tokenProps["addresses"][tokenChain],
                            "chainName": currentChainDetails["name"],
                            "chainId": tokenChain
                        }

                        prices.append(priceObject)

                    except:
                        pass

                tokenPrices[tokenProps['name']]["prices"] = prices

    filteredTokenPrices = {k: v for k, v in tokenPrices.items() if v["prices"]}

    tokenPricesSorted = {}
    for currentTokenName, currentTokenPrices in filteredTokenPrices.items():
        tokenPricesSorted[currentTokenName] = sorted([d for d in currentTokenPrices["prices"] if d["tokenPrice"] > 0], key=lambda d: d["tokenPrice"], reverse=True)

    tokenPricesFinal = {}
    for currentTokenName, currentTokenPrices in tokenPricesSorted.items():
        tokenPricesFinal[currentTokenName] = {}
        tokenPricesFinal[currentTokenName]["prices"] = currentTokenPrices
        tokenPricesFinal[currentTokenName]["recipe"] = {}
        tokenPricesFinal[currentTokenName]["recipe"]["tokenOne"] = currentTokenPrices[0]
        tokenPricesFinal[currentTokenName]["recipe"]["tokenTwo"] = currentTokenPrices[-1]
        tokenPricesFinal[currentTokenName]["recipe"]["difference"] = calculateDifference(pairOne=currentTokenPrices[0]["tokenPrice"], pairTwo=currentTokenPrices[-1]["tokenPrice"])

    return tokenPricesFinal

def saveToCache(fileName, fileData):
    with open(f'../../data/cache/{fileName}.json', 'w') as cacheFile:
        json.dump(fileData, cacheFile, indent=4, use_decimal=True)

def loadFromCache(fileName):
    with open(f'../../data/cache/{fileName}.json', 'r') as cacheFile:
        return json.load(cacheFile)

def calculateDifference(pairOne, pairTwo):

    ans = ((pairOne - pairTwo) / ((pairOne + pairTwo) / 2)) * 100

    return round(ans, 6)

print("Getting Dexs...")
if useCache:
    bridgeableDexs = loadFromCache(fileName="bridgeableDexs")
else:
    bridgeableDexs = getDexsFromLocal()
    saveToCache(fileName="bridgeableDexs", fileData=bridgeableDexs)

print("Getting Tokens...")
if useCache:
    bridgeableTokens = loadFromCache(fileName="bridgeableTokens")
    chainsDetails = loadFromCache(fileName="chainsDetails")
else:
    bridgeableTokens, chainsDetails = getAllBridgeableTokensFromURL()
    saveToCache(fileName="bridgeableTokens", fileData=bridgeableTokens)
    saveToCache(fileName="chainsDetails", fileData=chainsDetails)

print("Getting Chains...")
if useCache:
    allChainIds = loadFromCache(fileName="allChainIds")
else:
    allChainIds = getAllChainIds(bridgeableTokens)
    saveToCache(fileName="allChainIds", fileData=allChainIds)

print("Getting Tokens For Chains...")
if useCache:
    tokensByChain = loadFromCache(fileName="tokensByChain")
else:
    tokensByChain = getTokenByChain(allChainIds, chainsDetails)
    saveToCache(fileName="tokensByChain", fileData=tokensByChain)

print("Getting USDC Details...")
if useCache:
    stablecoinDetails = loadFromCache(fileName="stablecoinDetails")
else:
    stablecoinName = "USD Circle"
    stablecoinDetails = bridgeableTokens[stablecoinName]
    saveToCache(fileName="stablecoinDetails", fileData=stablecoinDetails)

printSeperator(newLine=True)

print("Getting Prices Cross Chain...")
if useCache:
    tokenPrices = loadFromCache(fileName="tokenPrices")
else:
    tokenPrices = getPricesForAllTokensOnAllDexs(bridgeableTokens=bridgeableTokens, bridgeableDexs=bridgeableDexs)
    saveToCache(fileName="tokenPrices", fileData=tokenPrices)

x = 1

# Local Arb
# for chainId, chainProps in bridgeableTokensByChain.items():
#
#     if "dexs" in chainProps:
#
#         print(f"-----------------------------------")
#         print(f"{chainProps['chain']['name']}")
#         print(f"-----------------------------------")
#
#         stablecoin = next(item for item in chainProps["tokens"] if item["name"] == stablecoinName)
#
#         for token in chainProps["tokens"]:
#
#             if token["name"] != stablecoinName:
#
#                 tokenPrices = []
#
#                 for dex in chainProps["dexs"]:
#
#                     try:
#                         tokenPrice = getSwapQuoteOut(
#                             amountInNormal=1.0,
#                             amountInDecimals=token["decimal"],
#                             amountOutDecimals=stablecoin["decimal"],
#                             rpcUrl=chainProps["chain"]["rpc"][0],
#                             routerAddress=dex["router"],
#                             routes=[token["address"], stablecoin["address"]]
#                         )
#
#                     except Exception as e:
#                         tokenPrice = None
#                         pass
#
#                     priceObject = {
#                         "name": token['name'],
#                         "price": tokenPrice,
#                         "dex": dex["name"],
#                         "router": dex["router"]
#                     }
#
#                     tokenPrices.append(priceObject)
#
#                 validPrices = [i for i in tokenPrices if not (i['price'] is None) and (i['price'] != 0)]
#
#                 if len(validPrices) > 1:
#
#                     print(f"  - {validPrices[0]['name']}")
#
#                     sortedValidPrices = sorted(validPrices, key=lambda d: d['price'], reverse=True)
#
#                     for validPrice in validPrices:
#                         print("    - Price On", validPrice["dex"], ":", validPrice["price"])
#
#                     highestPrice = sortedValidPrices[0]["price"]
#                     lowestPrice = sortedValidPrices[-1]["price"]
#
#                     percentageDiff = calculateDifference(pairOne=highestPrice, pairTwo=lowestPrice)
#
#                     print("      - Difference", f"{percentageDiff}%")

# with open('../../data/collection/allTokensByChainID.json', 'w') as fp:
#     json.dump(bridgeableTokensByChain, fp, indent=4)

x = 1