import requests
import simplejson as json


def saveToCache(fileName, fileData):
    with open(f'../../data/cache/done/{fileName}.json', 'w') as cacheFile:
        json.dump(fileData, cacheFile, indent=4, use_decimal=True)

with open(f'../../data/cache/resource/chainsDetails.json', 'r') as cacheFile:
    chains = json.load(cacheFile)

with open(f'../../data/cache/resource/dexDetails.json', 'r') as cacheFile:
    dexs = json.load(cacheFile)

with open(f'../../data/cache/resource/chainAPIKeyList.json', 'r') as cacheFile:
    explorerKeys = json.load(cacheFile)

masterChainList = {}

for chainId, chainDetails in chains.items():
    masterChainList[chainId] = \
        {
            "id": chainId,
            "name": chainDetails["name"],
            "rpc": chainDetails["rpc"][0],
            "uniswapFactory": "0xefa94DE7a4656D787667C749f7E1223D71E9FD88",
            "uniswapRouter": "0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106",
            "blockExplorer": {
                "url": chainDetails["explorers"][0]["url"],
                "standard": chainDetails["explorers"][0]["standard"],
            },
            "gasDetails": {
                "address": None,
                "symbol": chainDetails["nativeCurrency"]["symbol"],
                "decimals": chainDetails["nativeCurrency"]["decimals"],
                "name": chainDetails["nativeCurrency"]["name"],
            },
        }

    if chainId in dexs.keys():
        masterChainList[chainId]["dexs"] = dexs[chainId]
    else:
        masterChainList[chainId]["dexs"] = None

    if chainId in explorerKeys.keys():
        masterChainList[chainId]["blockExplorer"]["apiKey"] = explorerKeys[chainId]
    else:
        masterChainList[chainId]["blockExplorer"]["apiKey"] = None

    print(f"----------------------------------")
    print(f"{masterChainList[chainId]['name']}")
    print(f"----------------------------------")

    if masterChainList[chainId]["dexs"] and masterChainList[chainId]["blockExplorer"]["apiKey"]:

        contractsToGet = ["factory", "router"]
        apiKey = masterChainList[chainId]["blockExplorer"]["apiKey"]

        for dex in masterChainList[chainId]["dexs"]:

            print(f"{dex['name']}")

            for contract in contractsToGet:

                if contract in dex:
                    address = dex[contract]
                    apiBase = (masterChainList[chainId]["blockExplorer"]["url"]).split("//")[1]
                    apiUrl = f"https://api.{apiBase}/api?module=contract&action=getabi&address={address}&format=raw&apikey={apiKey}"
                    try:
                        abi = requests.get(apiUrl).json()
                        dex[contract] = {"address": address, "abi": abi}
                    except:
                        print(f"Couldn't get {contract} for {dex['name']}")
                else:
                    print(f"Missing {contract} for {dex['name']}")
    elif not masterChainList[chainId]["dexs"] and masterChainList[chainId]["blockExplorer"]["apiKey"]:
        print(f"Missing Dex List & API Key")
    elif not masterChainList[chainId]["dexs"]:
        print(f"Missing Dex List")
    else:
        print(f"Missing API Key")

    print(f"----------------------------------", "\n")

saveToCache(fileName="chainMasterList", fileData=masterChainList)

# "avalanche": {
#       "blockExplorer": "https://snowtrace.io/tx",
#       "frontendUrl": "https://app.pangolin.exchange",
#       "gasDetails": {
#         "address": "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
#         "symbol": "WAVAX"
#       },
#       "id": "43114",
#       "rpc": "https://api.avax.network/ext/bc/C/rpc",
#       "uniswapFactory": "0xefa94DE7a4656D787667C749f7E1223D71E9FD88",
#       "uniswapRouter": "0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106"
#     }

x = 1
