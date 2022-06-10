import logging
from num2words import num2words

from src.api.firebase import fetchFromDatabase
from src.api.synapsebridge import getBridgeableTokens
from src.api.dexscreener import getTokenPriceByDexId

# Set up our logging
logger = logging.getLogger("DFK-DEX")

# Get the details of our recipe
def getRecipeDetails():

    chains = fetchFromDatabase("chains")
    recipes = fetchFromDatabase("recipes")

    for recipesTitle, recipeDetails in recipes.items():

        recipeToken = recipeDetails["data"]["token"]
        recipeStablecoin = recipeDetails["data"]["stablecoin"]

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

            recipeDetails[f"chain{num}"]["gas"] = {}
            recipeDetails[f"chain{num}"]["gas"]["address"] = recipeDetails[f"chain{num}"]["chain"]["gas"]
            recipeDetails[f"chain{num}"]["gas"]["symbol"] = recipeDetails[f"chain{num}"]["chain"]["symbol"]
            # recipeDetails[f"chain{num}"]["gas"]["price"] = Dex.getGasPrice(recipeDetails[f"chain{num}"]["chain"]["name"], recipeDetails[f"chain{num}"]["chain"]["pair"])

            recipeDetails[f"chain{num}"]["stablecoin"]["price"] = \
                getTokenPriceByDexId(
                    chainName=recipeDetails[f"chain{num}"]["chain"]["name"],
                    tokenAddress=recipeDetails[f"chain{num}"]["stablecoin"]["address"],
                    dexId=recipeDetails["data"]["dexId"]
                )

            if recipeDetails[f"chain{num}"]["stablecoin"]["price"] is None:
                recipeDetails[f"chain{num}"]["stablecoin"]["price"] = 1.0

            del recipeDetails[f"chain{num}"]["chain"]["symbol"], recipeDetails[f"chain{num}"]["chain"]["gas"], recipeDetails[f"chain{num}"]["chain"]["pair"]

    return recipes