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
from src.recipe.recipe_Utils import getHumanReadableRecipeType
from src.tokens.tokens_Query import getTokenBySymbolAndChainID
from src.tokens.tokens_Parse import parseTokenLists
from src.utils.data.data_Booleans import strToBool
from src.utils.logging.logging_Print import printSeparator
from src.utils.logging.logging_Setup import getProjectLogger
from src.utils.text.text_Transformation import camelCaseSplit

logger = getProjectLogger()

# Get the details of our recipe
def getRecipeDetails():

    printSeparator()
    logger.info(f"Importing Recipes...")
    printSeparator()

    # Get All The Data From Firebase
    allDexs = fetchFromDatabase("dexs")
    allChains = fetchFromDatabase("chains")
    allRecipes = fetchFromDatabase("recipes")
    allBridges = fetchFromDatabase("bridges")

    # Valid Recipe Types
    validRecipeTypes = ["crossChain", "internalChain"]

    # Fill In All Recipe Data
    for recipeType, recipeCollection in allRecipes.items():

        # Amount Of Recipes Before Removing Disabled Ones
        initLength = len(recipeCollection)

        # Remove All Disabled Recipes For All Types Of Recipe Types
        recipeCollection = removeDisabledRecipes(recipes=recipeCollection)

        if recipeType not in validRecipeTypes:
            sys.exit(f"Invalid Recipe Type: {recipeType} - Must Be One Of: {validRecipeTypes}")

        recipeTypeHuman = getHumanReadableRecipeType(recipeType=recipeType)
        finalLength = len(recipeCollection)
        logger.info(f"{recipeTypeHuman} [{finalLength}/{initLength}]")

        isCrossChain = recipeType == "crossChain"

        for recipeTitle, recipeDetails in recipeCollection.items():

            logger.info(f"- {recipeTitle}")

            recipeTokenRetrievalMethod = recipeDetails["arbitrage"]["tokenRetrievalMethod"]
            recipeChains = sum('chain' in s for s in recipeDetails.keys())

            if isCrossChain:
                recipeBridge = recipeDetails["arbitrage"]["bridgeToUse"]
            else:
                recipeBridge = None

            for i in range(0, recipeChains):

                if isCrossChain:
                    num = num2words(i + 1).title()
                    chainKey = f"chain{num}"
                else:
                    x = 1
                    chainKey = f"chain"

                chainName = recipeDetails[chainKey]["chain"]["name"]

                # Get The Current Recipe Chain Details
                recipeDetails[chainKey]["chain"] = addChainInformation(
                    recipe=recipeDetails,
                    chainList=allChains,
                    chainName=chainName,
                    chainNumber=chainKey
                )

                chainId = recipeDetails[chainKey]["chain"]["id"]

                # Get The Current Recipe Chain Details
                recipeDetails[chainKey]["dexs"] = addDexContractAbis(
                    dexList=allDexs,
                    chainName=chainName
                )

                if isCrossChain:
                    # Get Bridge To Used
                    recipeDetails[chainKey]["bridge"] = allBridges[chainName][recipeBridge]

                chainGasToken = getNetworkWETH(
                    chainRecipe=recipeDetails[chainKey]
                )

                recipeDetails[chainKey] = parseDexTokenLists(
                    chainRecipe=recipeDetails[chainKey],
                    chainName=chainName,
                    chainId=chainId,
                    isCrossChain=isCrossChain
                )

                if recipeTokenRetrievalMethod == "tokenList":

                    recipeDetails = fillRecipeFromTokenList(
                        recipeDetails=recipeDetails,
                        chainNumber=chainKey,
                        chainGasToken=chainGasToken,
                        isCrossChain=isCrossChain
                    )

                elif recipeTokenRetrievalMethod == "apis":

                    recipeDetails = fillRecipeFromAPI(
                        recipeDetails=recipeDetails,
                        chainNumber=chainKey,
                        chainGasToken=chainGasToken
                    )

                else:
                    raise Exception(F"Invalid Token Retrieval Method: {recipeTokenRetrievalMethod}")

        allRecipes[recipeType] = recipeCollection

    return allRecipes

def fillRecipeFromTokenList(recipeDetails, chainNumber, chainGasToken, isCrossChain):
    
    dexToUse = recipeDetails[chainNumber]["chain"]["primaryDex"]

    if isCrossChain:
        toFill = {
            "token": recipeDetails[chainNumber]["token"],
            "stablecoin": recipeDetails[chainNumber]["stablecoin"]
        }
    else:
        toFill = {
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
                tokenListDataframe=recipeDetails[chainNumber]["dexs"][dexToUse]["tokenList"],
                tokenSymbol=tokenDetails["symbol"],
                tokenChainId=recipeDetails[chainNumber]["chain"]["id"]
            )
            recipeDetails[chainNumber][tokenType] = recipeDetails[chainNumber][tokenType] | tokenDetails

    if isCrossChain:

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
                            tokenListDataframe=recipeDetails[chainNumber]["dexs"][dexToUse]["tokenList"],
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
    return {recipeName: recipeDetail for recipeName, recipeDetail in recipes.items() if recipeDetail["arbitrage"]["enabled"]}
