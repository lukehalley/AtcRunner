from src.apis.dexScreener.dexScreener_Querys import getTokenPriceByDexId
from src.apis.synapseBridge.synapseBridge_Querys import queryBridgeableTokens
from src.tokens.tokens_Query import getTokenBySymbolAndChainID
from src.utils.data.data_Booleans import strToBool
from src.utils.logging.logging_Setup import getProjectLogger

logger = getProjectLogger()

def removeDisabledRecipes(recipes):
    initLength = len(recipes)
    recipes = {recipeName: recipeDetail for recipeName, recipeDetail in recipes.items() if recipeDetail["enabled"]}
    logger.info(f"Imported {len(recipes)}/{initLength} Recipes")
    return recipes

def fillRecipeFromTokenList(recipeDetails, chainNumber, chainGasToken, masterTokenList):
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
                tokenListDataframe=masterTokenList,
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
                        tokenListDataframe=masterTokenList,
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

    recipeDetails = addChainStablecoinInformation(
        recipeDetails=recipeDetails,
        chainNumber=chainNumber,
        dexId=recipeDetails["arbitrage"]["dexId"]
    )

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
                    recipeDetails[chainNumber][key]["decimals"] = tokenDetails["decimals"][recipeDetails[chainNumber]["chain"]["id"]]
                else:
                    recipeDetails[chainNumber][key]["decimals"] = None

                recipeDetails[chainNumber][key]["address"] = tokenDetails["addresses"][recipeDetails[chainNumber]["chain"]["id"]]
                recipeDetails[chainNumber][key]["swapType"] = tokenDetails["swapType"]
                recipeDetails[chainNumber][key]["wrapperAddresses"] = tokenDetails["wrapperAddresses"]

    recipeDetails = addChainGasInformation(
        recipeDetails=recipeDetails,
        chainNumber=chainNumber,
        chainGasToken=chainGasToken
    )

    recipeDetails = addChainStablecoinInformation(
        recipeDetails=recipeDetails,
        chainNumber=chainNumber,
        dexId=recipeDetails["arbitrage"]["dexId"]
    )

    return recipeDetails

def addChainGasInformation(recipeDetails, chainNumber, chainGasToken):

    recipeDetails[chainNumber]["gas"] = {}
    recipeDetails[chainNumber]["gas"]["symbol"] = recipeDetails[chainNumber]["chain"]["gasDetails"]["symbol"]
    recipeDetails[chainNumber]["gas"]["address"] = chainGasToken

    recipeDetails[chainNumber]["chain"]["contracts"]["weth"]["address"] = chainGasToken

    return recipeDetails

def addChainStablecoinInformation(recipeDetails, chainNumber, dexId):

    recipeDetails[chainNumber]["stablecoin"]["price"] = \
        getTokenPriceByDexId(
            chainName=recipeDetails[chainNumber]["chain"]["name"],
            tokenAddress=recipeDetails[chainNumber]["stablecoin"]["address"],
            dexId=dexId
        )

    if recipeDetails[chainNumber]["stablecoin"]["price"] is None:
        recipeDetails[chainNumber]["stablecoin"]["price"] = 1.0

    return recipeDetails