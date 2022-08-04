import requests
import simplejson as json
from src.data.tokenLists import parseTokenLists

with open(f'../../data/cache/done/chainMasterList.json', 'r') as cacheFile:
    chainMasterList = json.load(cacheFile)

tokenListURLs = []

for chainId, chainDetails in chainMasterList.items():
    for dex in chainDetails["dexs"]:
        for url in dex["tokenList"]:
            if url not in tokenListURLs:
                tokenListURLs.append(url)

parseTokenLists(urls=tokenListURLs)

x = 1