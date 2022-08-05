import requests
import simplejson as json
from src.data.tokenLists import parseTokenLists
from src.wallet.queries.swap import getSwapQuoteOut

with open(f'data/cache/done/chainMasterList.json', 'r') as cacheFile:
    chainMasterList = json.load(cacheFile)

with open(f'data/cache/old/bridgeableTokens.json', 'r') as cacheFile:
    bridgeableTokens = json.load(cacheFile)

def combineAllChainTokenLists():

    tokenListURLs = []

    for chainId, chainDetails in chainMasterList.items():
        for dex in chainDetails["dexs"]:
            for url in dex["tokenList"]:
                if url not in tokenListURLs:
                    tokenListURLs.append(url)

    allTokens = parseTokenLists(urls=tokenListURLs)



def testMasterList():
    success = 0
    fail = 0

    usdcDetails = bridgeableTokens["USD Circle"]
    for tokenName, tokenDetails in bridgeableTokens.items():

        print("----------------")
        print(f'{tokenDetails["name"]}')
        print("----------------")

        for chainId, chainDetails in chainMasterList.items():
            haveChainDetails = chainId in tokenDetails["addresses"] and chainId in tokenDetails["decimals"]
            haveStablecoinDetails = chainId in usdcDetails["addresses"] and chainId in usdcDetails["decimals"]
            if haveChainDetails and haveStablecoinDetails:
                print(f"{chainDetails['name']} [{tokenDetails['addresses'][chainId]}]")

                stablecoinAddress = usdcDetails["addresses"][chainId]
                stablecoinDecimals = usdcDetails["decimals"][chainId]

                tokenAddress = tokenDetails["addresses"][chainId]
                tokenDecimals = tokenDetails["decimals"][chainId]

                if stablecoinAddress and stablecoinDecimals and tokenDecimals and tokenAddress:

                    for dex in chainDetails["dexs"]:

                        x = 1

                        quote, outcome = getSwapQuoteOut(
                            amountInNormal=1.0,
                            amountInDecimals=tokenDecimals,
                            amountOutDecimals=stablecoinDecimals,
                            rpcUrl=chainDetails["rpc"],
                            routerAddress=dex["router"]["address"],
                            abi=dex["router"]["abi"],
                            routes=[tokenAddress, stablecoinAddress]
                        )

                        if quote > 0:
                            success = success + 1
                            print(f"    ✅ {dex['name']} - {quote}")
                        else:
                            print(f"    ⛔️ {dex['name']} - {outcome}")
                            fail = fail + 1

        print("----------------", "\n")

    print("\n", f"{success}/{success+fail}")

    x = 1