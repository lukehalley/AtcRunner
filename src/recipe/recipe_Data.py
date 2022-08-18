from num2words import num2words

from src.apis.dexScreener.dexScreener_Querys import getTokenPriceByDexId
from src.apis.firebaseDB.firebaseDB_Querys import fetchFromDatabase
from src.apis.synapseBridge.synapseBridge_Querys import queryBridgeableTokens
from src.chain.network.network_Querys import getNetworkWETH
from src.tokens.tokens_Parse import parseTokenLists
from src.tokens.tokens_Query import getTokenBySymbolAndChainID
from src.utils.data.data_Booleans import strToBool
from src.utils.logging.logging_Setup import getProjectLogger

logger = getProjectLogger()

# Get the details of our recipe
def getRecipeDetails():

    chains = fetchFromDatabase("chains")
    recipes = fetchFromDatabase("recipes")

    for recipesTitle, recipeDetails in recipes.items():

        dexId = recipeDetails["arbitrage"]["dexId"]

        tokenRetrievalMethod = recipeDetails["arbitrage"]["tokenRetrievalMethod"]
        tokenList = recipeDetails["arbitrage"]["tokenList"]

        tokenLists = fetchFromDatabase(reference="tokenLists")[tokenList]
        masterTokenList = parseTokenLists(urls=tokenLists)

        for i in range(1, 3):

            num = num2words(i).title()
            chainNumber = f"chain{num}"
            
            chain = chains[recipeDetails[chainNumber]["chain"]["name"]]
            recipeDetails[chainNumber]["chain"].update(chain)

            chainId = recipeDetails[chainNumber]["chain"]["id"]
            
            chainWrappedGasTokenAddress = getNetworkWETH(
                rpcUrl=recipeDetails[chainNumber]["chain"]["rpc"],
                routerAddress=recipeDetails[chainNumber]["chain"]["contracts"]["router"]["address"],
                routerABI=recipeDetails[chainNumber]["chain"]["contracts"]["router"]["abi"],
                routerABIMappings=recipeDetails[chainNumber]["chain"]["contracts"]["router"]["mapping"]
            )

            if tokenRetrievalMethod == "tokenList":

                toFill = {
                    "token": recipeDetails[chainNumber]["token"],
                    "stablecoin": recipeDetails[chainNumber]["stablecoin"]
                }

                for tokenType, tokenDetails in toFill.items():
                    tokenDetails["isGas"] = strToBool(tokenDetails["isGas"])
                    if tokenDetails["isGas"]:
                        gasTokenDetails = {
                            "address": chainWrappedGasTokenAddress,
                            "chainId": chainId,
                            "decimals": 18,
                            "name": tokenDetails["symbol"],
                            "symbol": tokenDetails["symbol"],
                            "logoURI": None
                        }
                        recipeDetails[chainNumber][tokenType] = recipeDetails[chainNumber][tokenType] | gasTokenDetails
                    else:
                        tokenDetails = getTokenBySymbolAndChainID(
                            tokenListDataframe=masterTokenList,
                            tokenSymbol=tokenDetails["symbol"],
                            tokenChainId=chainId
                        )
                        recipeDetails[chainNumber][tokenType] = recipeDetails[chainNumber][tokenType] | tokenDetails

                for routeDirection, routeContents in recipeDetails[chainNumber]["routes"].items():

                    routeFirst = routeDirection.split("-")[0]
                    routeLast = routeDirection.split("-")[1]

                    if routeContents != '':
                        routeSymbols = routeContents.split(",")

                        routeSymbols.pop(0)
                        routeSymbols.pop(-1)
                        routeAddressList = [recipeDetails[chainNumber][routeFirst]["address"]]

                        for routeSymbol in routeSymbols:

                            if routeSymbol == "{NETWORK_GAS_TOKEN}":
                                routeAddressList.append(chainWrappedGasTokenAddress)
                            else:
                                tokenDetails = getTokenBySymbolAndChainID(
                                    tokenListDataframe=masterTokenList,
                                    tokenSymbol=routeSymbol,
                                    tokenChainId=chainId
                                )
                                routeAddressList.append(tokenDetails["address"])

                        routeAddressList.append(recipeDetails[chainNumber][routeLast]["address"])
                    else:
                        routeAddressList = [recipeDetails[chainNumber][routeFirst]["address"], recipeDetails[chainNumber][routeLast]["address"]]

                    recipeDetails[chainNumber]["routes"][routeDirection] = routeAddressList

            elif tokenRetrievalMethod == "apis":

                recipeToken = recipeDetails["arbitrage"]["token"]
                recipeStablecoin = recipeDetails["arbitrage"]["stablecoin"]

                toFill = {
                    "token": recipeToken,
                    "stablecoin": recipeStablecoin
                }

                chainTokens = queryBridgeableTokens(chainId)
                for key, value in toFill.items():

                    for token in chainTokens:

                        if token["symbol"] == value or token["name"] == value:

                            tokenDetails = token

                            if key == "chain":
                                recipeDetails[chainNumber][key]["isGas"] = True
                            elif key in recipeDetails[chainNumber]:
                                recipeDetails[chainNumber][key]["isGas"] = recipeDetails[chainNumber][key]["isGas"]
                            else:
                                recipeDetails[chainNumber][key] = {}
                                recipeDetails[chainNumber][key]["isGas"] = tokenDetails["isETH"]

                            recipeDetails[chainNumber][key]["name"] = tokenDetails["name"]
                            recipeDetails[chainNumber][key]["symbol"] = tokenDetails["symbol"]

                            if "decimals" in tokenDetails:
                                recipeDetails[chainNumber][key]["decimals"] = tokenDetails["decimals"][chainId]
                            else:
                                recipeDetails[chainNumber][key]["decimals"] = None

                            recipeDetails[chainNumber][key]["address"] = tokenDetails["addresses"][chainId]
                            recipeDetails[chainNumber][key]["swapType"] = tokenDetails["swapType"]
                            recipeDetails[chainNumber][key]["wrapperAddresses"] = tokenDetails["wrapperAddresses"]
            else:
                raise Exception(F"Invalid Token Retrieval Method: {tokenRetrievalMethod}")

            recipeDetails[chainNumber]["gas"] = {}
            recipeDetails[chainNumber]["gas"]["symbol"] = recipeDetails[chainNumber]["chain"]["gasDetails"]["symbol"]
            recipeDetails[chainNumber]["gas"]["address"] = chainWrappedGasTokenAddress

            recipeDetails[chainNumber]["chain"]["contracts"]["weth"]["address"] = chainWrappedGasTokenAddress

            recipeDetails[chainNumber]["stablecoin"]["price"] = \
                getTokenPriceByDexId(
                    chainName=recipeDetails[chainNumber]["chain"]["name"],
                    tokenAddress=recipeDetails[chainNumber]["stablecoin"]["address"],
                    dexId=dexId
                )

            if recipeDetails[chainNumber]["stablecoin"]["price"] is None:
                recipeDetails[chainNumber]["stablecoin"]["price"] = 1.0

    recipes = {recipeName:recipeDetail for recipeName, recipeDetail in recipes.items() if recipeDetail["enabled"]}

    return recipes