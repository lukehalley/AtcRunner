import logging
import sys

from num2words import num2words

from src.api.dexscreener import getTokenPriceByDexId
from src.api.firebase import fetchFromDatabase
from src.api.synapsebridge import getBridgeableTokens
from src.data.tokenLists import getTokenBySymbolAndChainID, parseTokenLists
# Set up our logging
from src.utils.general import strToBool

logger = logging.getLogger("DFK-DEX")

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
            chain = chains[recipeDetails[f"chain{num}"]["chain"]["name"]]
            recipeDetails[f"chain{num}"]["chain"].update(chain)

            chainId = recipeDetails[f"chain{num}"]["chain"]["id"]
            chainGasTokenDetails = recipeDetails[f"chain{num}"]["chain"]["gasDetails"]

            if tokenRetrievalMethod == "tokenList":

                toFill = {
                    "token": recipeDetails[f"chain{num}"]["token"],
                    "stablecoin": recipeDetails[f"chain{num}"]["stablecoin"]
                }

                for tokenType, tokenDetails in toFill.items():
                    if strToBool(tokenDetails["isGas"]):
                        gasTokenDetails = {
                            "address": recipeDetails[f"chain{num}"]["chain"]["gasDetails"]["address"],
                            "chainId": chainId,
                            "decimals": 18,
                            "name": tokenDetails["symbol"],
                            "symbol": tokenDetails["symbol"],
                            "logoURI": None
                        }
                        recipeDetails[f"chain{num}"][tokenType] = recipeDetails[f"chain{num}"][tokenType] | gasTokenDetails
                    else:
                        tokenDetails = getTokenBySymbolAndChainID(
                            tokenListDataframe=masterTokenList,
                            tokenSymbol=tokenDetails["symbol"],
                            tokenChainId=chainId
                        )
                        recipeDetails[f"chain{num}"][tokenType] = recipeDetails[f"chain{num}"][tokenType] | tokenDetails

                x = 1

                for routeDirection, routeContents in recipeDetails[f"chain{num}"]["routes"].items():

                    routeFirst = routeDirection.split("-")[0]
                    routeLast = routeDirection.split("-")[1]

                    if routeContents != '':
                        routeSymbols = routeContents.split(",")

                        routeSymbols.pop(0)
                        routeSymbols.pop(-1)
                        routeAddressList = [recipeDetails[f"chain{num}"][routeFirst]["address"]]

                        for routeSymbol in routeSymbols:

                            if routeSymbol == chainGasTokenDetails["symbol"]:
                                routeAddressList.append(chainGasTokenDetails["address"])
                            else:
                                tokenDetails = getTokenBySymbolAndChainID(
                                    tokenListDataframe=masterTokenList,
                                    tokenSymbol=routeSymbol,
                                    tokenChainId=chainId
                                )
                                routeAddressList.append(tokenDetails["address"])

                        routeAddressList.append(recipeDetails[f"chain{num}"][routeLast]["address"])
                    else:
                        routeAddressList = [recipeDetails[f"chain{num}"]["token"]["address"], recipeDetails[f"chain{num}"]["stablecoin"]["address"]]

                    recipeDetails[f"chain{num}"]["routes"][routeDirection] = routeAddressList

            elif tokenRetrievalMethod == "api":

                recipeToken = recipeDetails["arbitrage"]["token"]
                recipeStablecoin = recipeDetails["arbitrage"]["stablecoin"]

                toFill = {
                    "token": recipeToken,
                    "stablecoin": recipeStablecoin
                }

                chainTokens = getBridgeableTokens(chainId)
                for key, value in toFill.items():

                    for token in chainTokens:

                        if token["symbol"] == value or token["name"] == value:

                            tokenDetails = token

                            if key == "chain":
                                recipeDetails[f"chain{num}"][key]["isGas"] = True
                            elif key in recipeDetails[f"chain{num}"]:
                                recipeDetails[f"chain{num}"][key]["isGas"] = recipeDetails[f"chain{num}"][key]["isGas"]
                            else:
                                recipeDetails[f"chain{num}"][key] = {}
                                recipeDetails[f"chain{num}"][key]["isGas"] = tokenDetails["isETH"]

                            recipeDetails[f"chain{num}"][key]["name"] = tokenDetails["name"]
                            recipeDetails[f"chain{num}"][key]["symbol"] = tokenDetails["symbol"]

                            if "decimals" in tokenDetails:
                                recipeDetails[f"chain{num}"][key]["decimals"] = tokenDetails["decimals"][chainId]
                            else:
                                recipeDetails[f"chain{num}"][key]["decimals"] = None

                            recipeDetails[f"chain{num}"][key]["address"] = tokenDetails["addresses"][chainId]
                            recipeDetails[f"chain{num}"][key]["swapType"] = tokenDetails["swapType"]
                            recipeDetails[f"chain{num}"][key]["wrapperAddresses"] = tokenDetails["wrapperAddresses"]
            else:
                sys.exit(F"Invalid Token Retrieval Method: {tokenRetrievalMethod}")

            recipeDetails[f"chain{num}"]["gas"] = {}
            recipeDetails[f"chain{num}"]["gas"]["address"] = recipeDetails[f"chain{num}"]["chain"]["gasDetails"]["address"]
            recipeDetails[f"chain{num}"]["gas"]["symbol"] = recipeDetails[f"chain{num}"]["chain"]["gasDetails"]["symbol"]

            recipeDetails[f"chain{num}"]["stablecoin"]["price"] = \
                getTokenPriceByDexId(
                    chainName=recipeDetails[f"chain{num}"]["chain"]["name"],
                    tokenAddress=recipeDetails[f"chain{num}"]["stablecoin"]["address"],
                    dexId=dexId
                )

            if recipeDetails[f"chain{num}"]["stablecoin"]["price"] is None:
                recipeDetails[f"chain{num}"]["stablecoin"]["price"] = 1.0

    return recipes