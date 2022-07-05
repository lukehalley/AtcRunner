from json import JSONDecodeError
from pathlib import Path

from dotenv import load_dotenv
load_dotenv()

from src.utils.general import getDictLength, getProjectRoot
from src.api.synapsebridge import getBridgeableTokens
from src.wallet.queries.swap import getSwapQuoteOut
import urllib.request, json, os

finalDict = {}
allBridgeableTokens = []
filteredChains = []

# Get JSON of loads of networks
with urllib.request.urlopen("https://chainid.network/chains.json") as url:
    evmChains = json.loads(url.read().decode())

# Filter out testnet chains and get bridgeable tokens
for chain in evmChains:
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
            allBridgeableTokens.append(output)

# Sort by how many tokens they have
allBridgeableTokens.sort(key=getDictLength, reverse=True)

# Merge all bridgeable tokens
for currentDictList in allBridgeableTokens:
    for result in currentDictList:

        filterStrings = ["synapse", "doge", "terra", "usd"]
        hasFilterStrings = False
        for filterString in filterStrings:
            hasFilterString = any(filterString in (str(v)).lower() for v in result.values())

            if hasFilterString:
                hasFilterStrings = True
                break

        if not hasFilterStrings:
            currentName = result["name"]
            if currentName not in finalDict:
                finalDict[currentName] = result
            else:
                finalDict[currentName] = finalDict[currentName] | result

synapseAllBridgeabletokens = finalDict

root = getProjectRoot().parent

chainDetailsDictJSON = os.path.join(root, "data", "misc", "openXswap-misc", "Chains", "Chains.json")
chainDexsDictJSON = os.path.join(root, "data", "misc", "openXswap-misc", "Projects")

allChainsDetails = {}

for path in Path(chainDexsDictJSON).rglob('*.json'):
    try:
        currentJSON = json.load(open(path))
        allChainsDetails = allChainsDetails | currentJSON
    except JSONDecodeError:
        print(f"Invalid JSON: {path}")
        pass
    X = 1

chainDetailsDict = json.load(open(chainDetailsDictJSON))
chainDexsDictJ = json.load(open(chainDexsDictJSON))

chainId = list(chainDexsDictJ.keys())[0]
chainDetails = chainDetailsDict[chainId]
chainDexs = chainDexsDictJ[chainId]

stablecoin = finalDict["USD Circle"]

for dex in chainDexs:

    chainOneTokenPrice = getSwapQuoteOut(
        amountInNormal=1.0,
        amountInDecimals=finalDict["Wrapped AVAX"]["decimals"][chainId],
        amountOutDecimals=finalDict["USD Circle"]["decimals"][chainId],
        rpcUrl=chainDetails["rpc_url"],
        routerAddress=dex["router"],
        routes=[finalDict["Wrapped AVAX"]["addresses"][chainId], stablecoin["addresses"][chainId]]
    )

    print("Price On", dex["description"], ":", chainOneTokenPrice)

    x = 1

u = 1