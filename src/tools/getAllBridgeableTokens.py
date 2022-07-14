from copy import deepcopy
from json import JSONDecodeError
from pathlib import Path

from dotenv import load_dotenv
load_dotenv()

from src.api.synapsebridge import getBridgeableTokens
from src.utils.general import getDictLength, getProjectRoot
import urllib.request, json, os

from src.wallet.queries.swap import getSwapQuoteOut

root = getProjectRoot().parent

chainIdsToIgnore = [1]

synapseAllBridgeabletokens = {}
chainsDetails = {}

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

print("Getting Dexs...")
bridgeableDexs = getDexsFromLocal()

print("Getting Tokens...")
bridgeableTokens, chainsDetails = getAllBridgeableTokensFromURL()

print("Getting Chains...")
allChainIds = getAllChainIds(bridgeableTokens)

print("Getting Tokens For Chains...")
tokensByChain = getTokenByChain(allChainIds, chainsDetails)

print("Getting USDC Details...")
stabecoinName = "USD Circle"
stabecoinDetails = synapseAllBridgeabletokens[stabecoinName]

# Global Arb
bridgeArb = {}
for tokenName, tokenProps in synapseAllBridgeabletokens.items():

    for tokenChain in allChainIds:

        try:
            chainOneTokenPrice = getSwapQuoteOut(
                amountInNormal=1.0,
                amountInDecimals=tokenProps["decimals"][tokenChain],
                amountOutDecimals=stabecoinDetails["decimals"][tokenChain],
                rpcUrl=chainsDetails[tokenChain]["rpc"][0],
                routerAddress=dex["router"],
                routes=[token["address"], stablecoin["address"]]
            )

        except Exception as e:
            chainOneTokenPrice = None
            pass

        priceObject = {
            "name": token['name'],
            "price": chainOneTokenPrice,
            "dex": dex["name"],
            "router": dex["router"]
        }



# Local Arb
# for chainId, chainProps in bridgeableTokensByChain.items():
#
#     if "dexs" in chainProps:
#
#         print(f"-----------------------------------")
#         print(f"{chainProps['chain']['name']}")
#         print(f"-----------------------------------")
#
#         stablecoin = next(item for item in chainProps["tokens"] if item["name"] == stabecoinName)
#
#         for token in chainProps["tokens"]:
#
#             if token["name"] != stabecoinName:
#
#                 tokenPrices = []
#
#                 for dex in chainProps["dexs"]:
#
#                     try:
#                         chainOneTokenPrice = getSwapQuoteOut(
#                             amountInNormal=1.0,
#                             amountInDecimals=token["decimal"],
#                             amountOutDecimals=stablecoin["decimal"],
#                             rpcUrl=chainProps["chain"]["rpc"][0],
#                             routerAddress=dex["router"],
#                             routes=[token["address"], stablecoin["address"]]
#                         )
#
#                     except Exception as e:
#                         chainOneTokenPrice = None
#                         pass
#
#                     priceObject = {
#                         "name": token['name'],
#                         "price": chainOneTokenPrice,
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

with open('../../data/collection/allTokensByChainID.json', 'w') as fp:
    json.dump(bridgeableTokensByChain, fp, indent=4)

x = 1