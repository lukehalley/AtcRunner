from num2words import num2words
from distutils import util

from helpers import Database, Bridge


def getRecipeDetails():

    recipes = Database.fetchFromDatabase("recipes")

    for recipesTitle, recipeDetails in recipes.items():

        recipeToken = recipeDetails["arbitrage"]["token"]
        recipeStablecoin = recipeDetails["arbitrage"]["stablecoin"]

        for i in range(1, 3):

            num = num2words(i).title()
            chainId = recipeDetails[f"chain{num}"]["chain"]["id"]

            chainTokens = Bridge.getBridgeableTokens(chainId)

            for token in chainTokens:
                if token["symbol"] == recipeToken:
                    tokenDetails = token
                    recipeDetails[f"chain{num}"]["token"]["isGas"] = bool(util.strtobool(recipeDetails[f"chain{num}"]["token"]["isGas"]))
                    recipeDetails[f"chain{num}"]["token"]["name"] = tokenDetails["name"]
                    recipeDetails[f"chain{num}"]["token"]["symbol"] = tokenDetails["symbol"]
                    recipeDetails[f"chain{num}"]["token"]["tokenDecimals"] = tokenDetails["decimals"][chainId]
                    recipeDetails[f"chain{num}"]["token"]["tokenAddress"] = tokenDetails["addresses"][chainId]
                    recipeDetails[f"chain{num}"]["token"]["swapType"] = tokenDetails["swapType"]
                    recipeDetails[f"chain{num}"]["token"]["wrapperAddresses"] = tokenDetails["wrapperAddresses"]
                    break

            for token in chainTokens:
                if token["name"] == recipeStablecoin:
                    tokenDetails = token
                    recipeDetails[f"chain{num}"]["stablecoin"] = {}
                    recipeDetails[f"chain{num}"]["stablecoin"]["name"] = tokenDetails["name"]
                    recipeDetails[f"chain{num}"]["stablecoin"]["symbol"] = tokenDetails["symbol"]
                    recipeDetails[f"chain{num}"]["stablecoin"]["tokenAddress"] = tokenDetails["addresses"][chainId]
                    recipeDetails[f"chain{num}"]["stablecoin"]["swapType"] = tokenDetails["swapType"]
                    recipeDetails[f"chain{num}"]["stablecoin"]["wrapperAddresses"] = tokenDetails["wrapperAddresses"]
                    break

    return recipes
