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

                    if "decimals" in tokenDetails:
                        recipeDetails[f"chain{num}"]["token"]["tokenDecimals"] = tokenDetails["decimals"][chainId]
                    else:
                        recipeDetails[f"chain{num}"]["token"]["tokenDecimals"] = None

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

                    if "decimals" in tokenDetails:
                        recipeDetails[f"chain{num}"]["stablecoin"]["tokenDecimals"] = tokenDetails["decimals"][chainId]
                    else:
                        recipeDetails[f"chain{num}"]["stablecoin"]["tokenDecimals"] = 6

                    recipeDetails[f"chain{num}"]["stablecoin"]["tokenAddress"] = tokenDetails["addresses"][chainId]
                    recipeDetails[f"chain{num}"]["stablecoin"]["swapType"] = tokenDetails["swapType"]
                    recipeDetails[f"chain{num}"]["stablecoin"]["wrapperAddresses"] = tokenDetails["wrapperAddresses"]
                    break

    return recipes

def addFee(recipe, amount, section):

    if "fees" not in recipe["status"]:
        recipe["status"]["fees"] = {}

    if "total" not in recipe["status"]["fees"]:
        recipe["status"]["fees"]["total"] = 0

    if section not in recipe["status"]["fees"]:
        recipe["status"]["fees"][section] = 0

    recipe["status"]["fees"][section] = recipe["status"]["fees"][section] + amount

    recipe["status"]["fees"]["total"] = 0

    for key, value in recipe["status"]["fees"].items():
        if key != "total":
            recipe["status"]["fees"]["total"] = recipe["status"]["fees"]["total"] + value

    return recipe