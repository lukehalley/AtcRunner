import requests
import simplejson as json

from src.utils.general import strToBool


def saveToCache(fileName, fileData):
    with open(f'../../data/cache/done/{fileName}.json', 'w') as cacheFile:
        json.dump(fileData, cacheFile, indent=4, use_decimal=True)

def getABIFromAPIUrl(masterChainList, chainId):
    apiBase = (masterChainList[chainId]["blockExplorer"]["url"]).split("//")[1]
    apiPrefix = masterChainList[chainId]["blockExplorer"]["apiPrefix"]
    if "{URL}" in apiPrefix:
        apiPrefix = apiPrefix.replace("{URL}", apiBase)
    url = f"https://{apiPrefix}/apis?module=contract&action=getabi&address={address}&format=raw&apikey={apiKey}"
    print(url)
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'}
    return requests.get(url, headers=headers).json()

with open(f'../../data/cache/done/chainMasterList.json', 'r') as cacheFile:
    outputMasterList = json.load(cacheFile)

with open(f'../../data/cache/resource/chainsDetails.json', 'r') as cacheFile:
    chains = json.load(cacheFile)

with open(f'../../data/cache/resource/dexDetails.json', 'r') as cacheFile:
    dexs = json.load(cacheFile)

with open(f'../../data/cache/resource/chainAPIKeyList.json', 'r') as cacheFile:
    explorerKeys = json.load(cacheFile)

masterChainList = {}

for chainId, chainDetails in chains.items():

    skipChain = strToBool(chainDetails["skip"])

    if not skipChain:

        masterChainList[chainId] = \
            {
                "id": chainId,
                "name": chainDetails["name"],
                "rpc": chainDetails["rpc"][0],
                "factory": "0xefa94DE7a4656D787667C749f7E1223D71E9FD88",
                "router": "0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106",
                "blockExplorer": {
                    "url": chainDetails["explorers"][0]["url"],
                    "apiPrefix": chainDetails["explorers"][0]["apiPrefix"],
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
        print(f"{masterChainList[chainId]['name']} [{chainId}]")
        print(f"----------------------------------")

        if masterChainList[chainId]["dexs"] and masterChainList[chainId]["blockExplorer"]["apiKey"]:

            contractsToGet = ["factory", "router"]
            apiKey = masterChainList[chainId]["blockExplorer"]["apiKey"]

            for dex in masterChainList[chainId]["dexs"]:

                print(f"{dex['name']}")

                index = next((index for (index, d) in enumerate(masterChainList[chainId]["dexs"]) if d["name"] == dex["name"]), None)

                for contract in contractsToGet:

                    if chainId in outputMasterList:

                        if outputMasterList[chainId]["dexs"]:
                            # If ABI is already present don't overwrite it

                            if chainId == "1666600000":
                                x = 1

                            if "abi" not in outputMasterList[chainId]["dexs"][index][contract]:

                                if contract in dex:
                                    address = dex[contract]
                                    try:
                                        abi = getABIFromAPIUrl(masterChainList=masterChainList,
                                                         chainId=chainId)
                                        dex[contract] = {"address": address, "abi": abi}
                                        print(f"   {contract} ✅")
                                    except:
                                        print(f"   {contract} ⛔️")
                                else:

                                    print(f"Missing {contract} for {dex['name']}")
                            else:
                                dex[contract] = outputMasterList[chainId]["dexs"][index][contract]
                                print(f"   {contract} ✅")
                        else:
                            if contract in dex:
                                address = dex[contract]
                                try:
                                    abi = getABIFromAPIUrl(masterChainList=masterChainList,
                                                           chainId=chainId)
                                    dex[contract] = {"address": address, "abi": abi}
                                    print(f"   {contract} ✅")
                                except:
                                    print(f"   {contract} ⛔️")
                            else:
                                print(f"Missing {contract} for {dex['name']}")

                    else:

                        if contract in dex:
                            address = dex[contract]
                            try:
                                abi = getABIFromAPIUrl(masterChainList=masterChainList,
                                                       chainId=chainId)
                                dex[contract] = {"address": address, "abi": abi}
                                print(f"   {contract} ✅")
                            except:
                                print(f"   {contract} ⛔️")
                        else:
                            print(f"Missing {contract} for {dex['name']}")

        elif not masterChainList[chainId]["dexs"] and not masterChainList[chainId]["blockExplorer"]["apiKey"]:
            print(f"Missing API Key ⛔")
            print(f"Missing Dex List ⛔")
        elif not masterChainList[chainId]["dexs"]:
            print(f"Missing Dex List ⛔")
        elif not masterChainList[chainId]["blockExplorer"]["apiKey"]:
            print(f"Missing API Key ⛔")

        print(f"----------------------------------", "\n")

# saveToCache(fileName="chainMasterList", fileData=masterChainList)

x = 1
