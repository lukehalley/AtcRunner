import sys

from src.utils.logging.logging_Setup import getProjectLogger

logger = getProjectLogger()

def addChainInformation(recipe, chainList, chainName, chainNumber):
    # Get The Current Recipe Chain Details
    if chainName in chainList:
        return recipe[chainNumber]["chain"] | chainList[chainName]
    else:
        sys.exit(f"No Chain Details In DB For {chainName}")

def addChainGasInformation(recipeDetails, chainNumber, chainGasToken):
    recipeDetails[chainNumber]["gas"] = {}
    recipeDetails[chainNumber]["gas"]["symbol"] = recipeDetails[chainNumber]["chain"]["gasDetails"]["symbol"]
    recipeDetails[chainNumber]["gas"]["address"] = chainGasToken
    recipeDetails[chainNumber]["gas"]["decimals"] = 18
    recipeDetails[chainNumber]["gas"]["isGas"] = True

    for dexName, dexDetails in recipeDetails[chainNumber]["dexs"].items():
        dexDetails["contracts"]["weth"]["address"] = chainGasToken

    return recipeDetails