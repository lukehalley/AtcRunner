import sys

from num2words import num2words

from src.apis.firebaseDB.firebaseDB_Querys import fetchFromDatabase
from src.chain.network.network_Querys import getNetworkWETH
from src.recipe.recipe_Parse import fillRecipeFromTokenList, fillRecipeFromAPI, removeDisabledRecipes, \
    addChainInformation, addDexContractAbis, parseDexTokenLists
from src.utils.logging.logging_Print import printSeparator
from src.utils.logging.logging_Setup import getProjectLogger

logger = getProjectLogger()


# Get the details of our recipe
def getRecipeDetails():

    printSeparator()
    logger.info(f"Importing Recipes...")
    printSeparator()

    allDexs = fetchFromDatabase("dexs")
    allChains = fetchFromDatabase("chains")
    allRecipes = fetchFromDatabase("recipes")

    recipes = removeDisabledRecipes(recipes=fetchFromDatabase("recipes"))

    for recipesTitle, recipeDetails in recipes.items():

        recipeTokenRetrievalMethod = recipeDetails["arbitrage"]["tokenRetrievalMethod"]

        for i in range(1, 3):

            num = num2words(i).title()
            chainNumber = f"chain{num}"
            chainName = recipeDetails[chainNumber]["chain"]["name"]

            # Get The Current Recipe Chain Details
            recipeDetails[chainNumber]["chain"] = addChainInformation(
                recipe=recipeDetails,
                chainList=allChains,
                chainName=chainName,
                chainNumber=chainNumber
            )

            chainId = recipeDetails[chainNumber]["chain"]["id"]

            # Get The Current Recipe Chain Details
            recipeDetails[chainNumber]["dexs"] = addDexContractAbis(
                dexList=allDexs,
                chainName=chainName
            )

            chainGasToken = getNetworkWETH(
                chainRecipe=recipeDetails[chainNumber]
            )

            recipeDetails[chainNumber] = parseDexTokenLists(
                chainRecipe=recipeDetails[chainNumber],
                chainName=chainName,
                chainId=chainId
            )

            if recipeTokenRetrievalMethod == "tokenList":

                recipeDetails = fillRecipeFromTokenList(
                    recipeDetails=recipeDetails,
                    chainNumber=chainNumber,
                    chainGasToken=chainGasToken
                )

            elif recipeTokenRetrievalMethod == "apis":

                recipeDetails = fillRecipeFromAPI(
                    recipeDetails=recipeDetails,
                    chainNumber=chainNumber,
                    chainGasToken=chainGasToken
                )

            else:
                raise Exception(F"Invalid Token Retrieval Method: {recipeTokenRetrievalMethod}")

    return recipes
