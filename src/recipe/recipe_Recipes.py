import sys

from num2words import num2words

from src.apis.dexScreener.dexScreener_Querys import getTokenPriceByDexId
from src.apis.firebaseDB.firebaseDB_Querys import fetchFromDatabase
from src.apis.gitlab.gitlab_Querys import getDexABIFileFromGitlab, getChainTokenListURLsFromGitlab, \
    getTokenListURLsFromGitlab, getTokenListFileFromGitlab
from src.apis.synapseBridge.synapseBridge_Querys import queryBridgeableTokens
from src.chain.network.network_Querys import getNetworkWETH
from src.recipe.recipe_Chain import addChainInformation, addChainGasInformation
from src.recipe.recipe_Dex import addDexContractAbis, parseDexTokenLists
from src.tokens.tokens_Query import getTokenBySymbolAndChainID
from src.tokens.tokens_Parse import parseTokenLists
from src.utils.data.data_Booleans import strToBool
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
    allBridges = fetchFromDatabase("bridges")

    recipes = removeDisabledRecipes(recipes=allRecipes)

    for recipesTitle, recipeDetails in recipes.items():

        recipeBridge = recipeDetails["arbitrage"]["primaryBridge"]
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

            # Get Bridge To Used
            x = 1
            recipeDetails[chainNumber]["bridge"] = allBridges[chainName][recipeBridge]

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

def fillRecipeFromTokenList(recipeDetails, chainNumber, chainGasToken):
    
    primaryDex = recipeDetails[chainNumber]["chain"]["primaryDex"]

    toFill = {
        "token": recipeDetails[chainNumber]["token"],
        "stablecoin": recipeDetails[chainNumber]["stablecoin"]
    }

    for tokenType, tokenDetails in toFill.items():
        tokenDetails["isGas"] = strToBool(tokenDetails["isGas"])
        if tokenDetails["isGas"]:
            gasTokenDetails = {
                "address": chainGasToken,
                "chainId": recipeDetails[chainNumber]["chain"]["id"],
                "decimals": 18,
                "name": tokenDetails["symbol"],
                "symbol": tokenDetails["symbol"],
                "logoURI": None
            }
            recipeDetails[chainNumber][tokenType] = recipeDetails[chainNumber][tokenType] | gasTokenDetails
        else:
            tokenDetails = getTokenBySymbolAndChainID(
                tokenListDataframe=recipeDetails[chainNumber]["dexs"][primaryDex]["tokenList"],
                tokenSymbol=tokenDetails["symbol"],
                tokenChainId=recipeDetails[chainNumber]["chain"]["id"]
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
                    routeAddressList.append(chainGasToken)
                else:
                    tokenDetails = getTokenBySymbolAndChainID(
                        tokenListDataframe=recipeDetails[chainNumber]["dexs"][primaryDex]["tokenList"],
                        tokenSymbol=routeSymbol,
                        tokenChainId=recipeDetails[chainNumber]["chain"]["id"]
                    )
                    routeAddressList.append(tokenDetails["address"])

            routeAddressList.append(recipeDetails[chainNumber][routeLast]["address"])
        else:
            routeAddressList = [recipeDetails[chainNumber][routeFirst]["address"],
                                recipeDetails[chainNumber][routeLast]["address"]]

        recipeDetails[chainNumber]["routes"][routeDirection] = routeAddressList

    recipeDetails = addChainGasInformation(
        recipeDetails=recipeDetails,
        chainNumber=chainNumber,
        chainGasToken=chainGasToken
    )

    # recipeDetails = addChainStablecoinInformation(
    #     recipeDetails=recipeDetails,
    #     chainNumber=chainNumber,
    #     dexId=recipeDetails["arbitrage"]["dexId"]
    # )

    return recipeDetails

def fillRecipeFromAPI(recipeDetails, chainNumber, chainGasToken):
    recipeToken = recipeDetails["arbitrage"]["token"]
    recipeStablecoin = recipeDetails["arbitrage"]["stablecoin"]

    toFill = {
        "token": recipeToken,
        "stablecoin": recipeStablecoin
    }

    chainTokens = queryBridgeableTokens(recipeDetails[chainNumber]["chain"]["id"])
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
                    recipeDetails[chainNumber][key]["decimals"] = tokenDetails["decimals"][
                        recipeDetails[chainNumber]["chain"]["id"]]
                else:
                    recipeDetails[chainNumber][key]["decimals"] = None

                recipeDetails[chainNumber][key]["address"] = tokenDetails["addresses"][
                    recipeDetails[chainNumber]["chain"]["id"]]
                recipeDetails[chainNumber][key]["swapType"] = tokenDetails["swapType"]
                recipeDetails[chainNumber][key]["wrapperAddresses"] = tokenDetails["wrapperAddresses"]

    recipeDetails = addChainGasInformation(
        recipeDetails=recipeDetails,
        chainNumber=chainNumber,
        chainGasToken=chainGasToken
    )

    # recipeDetails = addChainStablecoinInformation(
    #     recipeDetails=recipeDetails,
    #     chainNumber=chainNumber,
    #     dexId=recipeDetails["arbitrage"]["dexId"]
    # )

    return recipeDetails

def removeDisabledRecipes(recipes):
    initLength = len(recipes)
    recipes = {
        recipeName: recipeDetail for recipeName, recipeDetail in recipes.items() if recipeDetail["arbitrage"]["enabled"]}
    logger.info(f"Imported {len(recipes)}/{initLength} Recipes")
    return recipes
