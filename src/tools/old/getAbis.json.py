import simplejson as json
import time
import requests

etherscanAPIKey = "P9V56281GVUXJB7V7D5TQPI6HF9TPNGUJ6"

with open(f'../../data/cache/bridgeableDexs.json', 'r') as cacheFile:
    chainsDetails = json.load(cacheFile)

with open(f'../../data/cache/chainExplorers.json', 'r') as cacheFile:
    chainExplorers = json.load(cacheFile)

chainAbis = {}

def saveToCache(fileName, fileData):
    with open(f'../../data/cache/{fileName}.json', 'w') as cacheFile:
        json.dump(fileData, cacheFile, indent=4, use_decimal=True)

for chainId, dexList in chainsDetails.items():

    if chainId in chainExplorers.keys():

        chainAbis[chainId] = {}

        print(chainId)

        for dex in dexList:

            contractsToGet = ["factory", "router", "masterchef"]

            for contract in contractsToGet:

                if contract in dex:
                    address = dex[contract]
                    apiBase = chainExplorers[chainId]["scanApi"]
                    apiUrl = f"{apiBase}/api?module=contract&action=getabi&address={address}&format=raw&apikey={etherscanAPIKey}"
                    try:
                        chainAbis[chainId][dex["name"]] = {}
                        ABI = requests.get(apiUrl).json()
                        chainAbis[chainId][dex["name"]][contract] = ABI
                        print(ABI, "\n")
                    except:
                        pass
                else:
                    print(f"Missing {contract}")

saveToCache("chainABIs", chainAbis)

x = 1