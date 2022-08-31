import sys

from src.apis.gitlab.gitlab_Chains import getChainMetadataFromGitlab
from src.utils.logging.logging_Setup import getProjectLogger

logger = getProjectLogger()

def addChainInformation(recipe, chainName, chainNumber):
    chainMetadata = getChainMetadataFromGitlab(
        chainName=chainName
    )
    return recipe[chainNumber]["chain"] | chainMetadata

def addChainGasInformation(recipeDetails, chainNumber, chainGasToken):
    recipeDetails[chainNumber]["gas"] = {}
    recipeDetails[chainNumber]["gas"]["symbol"] = recipeDetails[chainNumber]["chain"]["gasDetails"]["symbol"]
    recipeDetails[chainNumber]["gas"]["address"] = chainGasToken
    recipeDetails[chainNumber]["gas"]["decimals"] = 18
    recipeDetails[chainNumber]["gas"]["isGas"] = True

    for dexName, dexDetails in recipeDetails[chainNumber]["dexs"].items():
        dexDetails["weth"]["address"] = chainGasToken

    return recipeDetails