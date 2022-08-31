import sys
import time

from num2words import num2words

from src.apis.firebaseDB.firebaseDB_Querys import fetchFromDatabase
from src.apis.gitlab.gitlab_Bridges import getBridgeMetadataFromGitlab
from src.apis.gitlab.gitlab_Strategies import getStrategiesFromGitlab
from src.apis.synapseBridge.synapseBridge_Querys import queryBridgeableTokens
from src.chain.network.network_Querys import getNetworkWETH
from src.recipe.recipe_Chain import addChainInformation, addChainGasInformation
from src.recipe.recipe_Dex import addDexContractAbis, parseDexTokenLists
from src.recipe.recipe_Utils import getHumanReadableRecipeType
from src.tokens.tokens_Query import getTokenBySymbolAndChainID
from src.utils.data.data_Booleans import strToBool
from src.utils.logging.logging_Print import printSeparator
from src.utils.logging.logging_Setup import getProjectLogger

logger = getProjectLogger()

# Get the details of our recipe
def getRecipeDetails():

    printSeparator()
    logger.info(f"Importing Recipes...")
    printSeparator()

    # Get All The Data From Firebase

    allRecipes = fetchFromDatabase("recipes")

    # Valid Recipe Types
    validRecipeTypes = ["crossChain", "internalChain"]

    # Caches For Already Processed Data
    chainMetadataCache = {}
    chainDexsCache = {}
    chainBridgesCache = {}
    chainTokenListCache = {}

    # Fill In All Recipe Data
    for recipeType, recipeCollection in allRecipes.items():

        # Amount Of Recipes Before Removing Disabled Ones
        initLength = len(recipeCollection)

        # Remove All Disabled Recipes For All Types Of Recipe Types
        recipeCollection = removeDisabledRecipes(recipes=recipeCollection)

        # Check If Recipe Type Is Valid
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

            # Add Arbitrage Strategy
            recipeDetails["arbitrage"]["strategy"] = {}
            recipeDetails["arbitrage"]["strategy"]["type"] = recipeType
            recipeDetails["arbitrage"]["strategy"]["steps"] = getStrategiesFromGitlab(
                recipeType=recipeType
            )

            if isCrossChain:
                recipeBridge = recipeDetails["arbitrage"]["bridgeToUse"]
            else:
                recipeBridge = None

            for i in range(0, recipeChains):

                if isCrossChain:
                    num = num2words(i + 1).title()
                    chainKey = f"chain{num}"
                else:
                    chainKey = f"chain"

                chainName = recipeDetails[chainKey]["chain"]["name"]

                # Get The Current Recipe Chain's Metadata
                # If We Already Have Got The Chains Metadata, Use That
                # Otherwise Get All The Chains Metadata
                if chainName in chainMetadataCache:
                    recipeDetails[chainKey]["chain"] = chainMetadataCache[chainName]
                else:
                    # Get The Current Recipe Chain Details
                    recipeDetails[chainKey]["chain"] = addChainInformation(
                        recipe=recipeDetails,
                        chainName=chainName,
                        chainNumber=chainKey
                    )
                    chainMetadataCache[chainName] = recipeDetails[chainKey]["chain"]

                chainId = recipeDetails[chainKey]["chain"]["id"]

                # Get The Current Recipe Chain's Dexs
                # If We Already Have Processed The Chains Dexs, Use That
                # Otherwise Get All The Dexs Data
                if chainName in chainDexsCache:
                    recipeDetails[chainKey]["dexs"] = chainDexsCache[chainName]
                else:
                    recipeDetails[chainKey]["dexs"] = addDexContractAbis(
                        chainName=chainName
                    )
                    chainDexsCache[chainName] = recipeDetails[chainKey]["dexs"]

                if isCrossChain:

                    # Create An Entry For The Bridge Cache
                    if chainName not in chainBridgesCache:
                        chainBridgesCache[chainName] = {}

                    # Get The Current isCrossChain Recipe's Chosen Bridge
                    # If We Already Have Retrieved The Chosen Bridge Details, Use That
                    # Otherwise Get The Bridges Details
                    if recipeBridge in chainBridgesCache[chainName]:
                        recipeDetails[chainKey]["bridge"] = chainBridgesCache[chainName][recipeBridge]
                    else:
                        recipeDetails[chainKey]["bridge"] = getBridgeMetadataFromGitlab(
                            chainName=chainName,
                            bridgeName=recipeBridge
                        )
                        chainBridgesCache[chainName][recipeBridge] = recipeDetails[chainKey]["bridge"]

                chainGasToken = getNetworkWETH(
                    chainRecipe=recipeDetails[chainKey]
                )

                # Get The Current Recipe Chain's Token List
                # If We Already Have Got The Chains Token List, Use That
                # Otherwise Get All The Chains Token List
                if chainName in chainTokenListCache:
                    recipeDetails[chainKey]["tokenList"] = chainTokenListCache[chainName]
                else:
                    # Get The Current Chains Token List
                    recipeDetails[chainKey]["tokenList"] = parseDexTokenLists(
                        chainRecipe=recipeDetails[chainKey],
                        chainName=chainName,
                        chainId=chainId,
                        isCrossChain=isCrossChain
                    )
                    chainTokenListCache[chainName] = recipeDetails[chainKey]["tokenList"]

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
                tokenListDataframe=recipeDetails[chainNumber]["tokenList"],
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
                            tokenListDataframe=recipeDetails[chainNumber]["tokenList"],
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
