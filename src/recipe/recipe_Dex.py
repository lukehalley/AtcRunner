import sys

from src.apis.gitlab.gitlab_ABIs import getDexABIFileFromGitlab
from src.apis.gitlab.gitlab_TokenLists import getTokenListFromGitlab
from src.tokens.tokens_Parse import parseTokenLists
from src.utils.logging.logging_Setup import getProjectLogger

logger = getProjectLogger()

def addDexContractAbis(dexList, chainName):

    finalDexList = {}

    # Get The Current Recipe Chain Details
    if chainName in dexList:
        chainDexs = dexList[chainName]

        for dexName, dexDetails in chainDexs.items():

            dexContracts = dexDetails["contracts"]

            expectedKeys = ['factory', 'router', 'weth']
            actualKeys = list(dexContracts.keys())

            hasCorrectContracts = actualKeys == expectedKeys

            if hasCorrectContracts:

                for contractName in actualKeys:

                    dexDetails["contracts"][contractName]["abi"] = getDexABIFileFromGitlab(
                        chainName=chainName,
                        dexName=dexName,
                        abiName=contractName
                    )

                finalDexList[dexName] = dexDetails

            else:

                missingContracts = list(set(expectedKeys) - set(actualKeys))

                sys.exit(f"The Dex '{dexName}' on Chain '{chainName}' is missing the following contract details: {missingContracts}")

        return finalDexList
    else:
        sys.exit(f"No Dexs In DB For {chainName}")

def parseDexTokenLists(chainRecipe, chainName, chainId, isCrossChain):

    if not isCrossChain:
        hasEnoughDexs = len(chainRecipe["dexs"]) > 1
        if not hasEnoughDexs:
            x = 1
            # logger.warn("   - Internal Chain Recipes Need At Least 2 Dexs!")

    for dexName, dexDetails in chainRecipe["dexs"].items():

        dexTokenList = getTokenListFromGitlab(
            path=f"{chainName}/{dexName}/external/external.json"
        )

        dexDetails["tokenList"] = parseTokenLists(
            tokenListURLs=dexTokenList,
            chainId = chainId,
            chainName=chainName
        )

    return chainRecipe

