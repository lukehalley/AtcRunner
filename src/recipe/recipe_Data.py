from num2words import num2words

from src.apis.firebaseDB.firebaseDB_Querys import fetchFromDatabase
from src.chain.network.network_Querys import getNetworkWETH
from src.recipe.recipe_Parse import fillRecipeFromTokenList, fillRecipeFromAPI, removeDisabledRecipes
from src.tokens.tokens_Parse import parseTokenLists
from src.utils.logging.logging_Print import printSeperator
from src.utils.logging.logging_Setup import getProjectLogger

logger = getProjectLogger()

# Get the details of our recipe
def getRecipeDetails():

    printSeperator()
    logger.info(f"Importing Recipes...")
    printSeperator()

    chains = fetchFromDatabase("chains")
    recipes = removeDisabledRecipes(recipes=fetchFromDatabase("recipes"))

    for recipesTitle, recipeDetails in recipes.items():

        tokenRetrievalMethod = recipeDetails["arbitrage"]["tokenRetrievalMethod"]
        tokenList = recipeDetails["arbitrage"]["tokenList"]

        tokenLists = fetchFromDatabase(reference="tokenLists")[tokenList]
        masterTokenList = parseTokenLists(urls=tokenLists)

        # TODO: Set recipe position

        for i in range(1, 3):

            num = num2words(i).title()
            chainNumber = f"chain{num}"
            
            chain = chains[recipeDetails[chainNumber]["chain"]["name"]]
            recipeDetails[chainNumber]["chain"].update(chain)
            
            chainGasToken = getNetworkWETH(
                recipe=recipeDetails
            )

            if tokenRetrievalMethod == "tokenList":

                recipeDetails = fillRecipeFromTokenList(
                    recipeDetails=recipeDetails,
                    chainNumber=chainNumber,
                    chainGasToken=chainGasToken,
                    masterTokenList=masterTokenList
                )

            elif tokenRetrievalMethod == "apis":

                recipeDetails = fillRecipeFromAPI(
                    recipeDetails=recipeDetails,
                    chainNumber=chainNumber,
                    chainGasToken=chainGasToken
                )

            else:
                raise Exception(F"Invalid Token Retrieval Method: {tokenRetrievalMethod}")

    return recipes