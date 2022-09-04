import sys

from src.apis.gitlab.gitlab_ABIs import getDexABIFileFromGitlab
from src.apis.gitlab.gitlab_Dexs import getDexsMetadataForChainFromGitlab
from src.apis.gitlab.gitlab_TokenLists import getTokenListFromGitlab
from src.tokens.tokens_Parse import parseTokenLists
from src.utils.logging.logging_Setup import getProjectLogger

logger = getProjectLogger()

def addDexContractAbis(chainName):

    finalDexList = {}

    chainDexs = getDexsMetadataForChainFromGitlab(
        chainName=chainName
    )

    # Get The Current Recipe Chain Details
    for dexName, dexDetails in chainDexs.items():

        expectedKeys = ['factory', 'router', 'weth']
        actualKeys = list(dexDetails.keys())

        hasCorrectContracts = actualKeys == expectedKeys

        if hasCorrectContracts:

            for contractName in actualKeys:
                dexDetails[contractName]["abi"] = getDexABIFileFromGitlab(
                    chainName=chainName,
                    dexName=dexName,
                    abiName=contractName
                )

            finalDexList[dexName] = dexDetails

        else:

            missingContracts = list(set(expectedKeys) - set(actualKeys))

            sys.exit(
                f"The Dex '{dexName}' on Chain '{chainName}' is missing the following contract details: {missingContracts}")

    return finalDexList

def parseDexTokenLists(chainRecipe, chainName, chainId, chainGasToken, isCrossChain):

    if not isCrossChain:
        hasEnoughDexs = len(chainRecipe["dexs"]) > 1
        if not hasEnoughDexs:
            x = 1
            # logger.warn("   - Internal Chain Recipes Need At Least 2 Dexs!")

    chainTokenList = getTokenListFromGitlab(
        path=f"{chainName}/external.json"
    )

    tokenList = parseTokenLists(
        tokenListURLs=chainTokenList,
        chainId=chainId,
        chainName=chainName,
        chainGasToken=chainGasToken
    )

    return tokenList

