import logging
import sys

from num2words import num2words

from src.api.firebase import fetchFromDatabase
from src.api.synapsebridge import getBridgeableTokens
from src.api.dexscreener import getTokenPriceByDexId
from src.data.tokenLists import getTokenBySymbolAndChainID, parseTokenLists

# Set up our logging
logger = logging.getLogger("DFK-DEX")

# Get the details of our recipe
def getRecipeDetails():

    chains = fetchFromDatabase("chains")
    recipes = fetchFromDatabase("recipes")

    for recipesTitle, recipeDetails in recipes.items():

        dexId = recipeDetails["arbitrage"]["dexId"]

        recipeToken = recipeDetails["arbitrage"]["token"]
        recipeStablecoin = recipeDetails["arbitrage"]["stablecoin"]
        tokenRetrievalMethod = recipeDetails["arbitrage"]["tokenRetrievalMethod"]
        tokenList = recipeDetails["arbitrage"]["tokenList"]

        if tokenRetrievalMethod == "tokenList":
            tokenLists = fetchFromDatabase(reference="tokenLists")[tokenList]
            masterTokenList = tokenListDataframe = parseTokenLists(urls=tokenLists)

        for i in range(1, 3):

            num = num2words(i).title()
            chain = chains[recipeDetails[f"chain{num}"]["chain"]["name"]]
            recipeDetails[f"chain{num}"]["chain"].update(chain)

            chainId = recipeDetails[f"chain{num}"]["chain"]["id"]

            chainTokens = getBridgeableTokens(chainId)

            toFill = {
                "token": recipeToken,
                "stablecoin": recipeStablecoin
            }

            if tokenRetrievalMethod == "tokenList":
                masterTokenList = tokenListDataframe = parseTokenLists(urls=tokenLists)
            elif tokenRetrievalMethod == "api":
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