import sys

from src.apis.dexScreener.dexScreener_Querys import getTokenPriceByDexId
from src.apis.gitlab.gitlab_Querys import getDexABIFileFromGitlab, getChainTokenListURLsFromGitlab, \
    getTokenListURLsFromGitlab, getTokenListFileFromGitlab
from src.apis.synapseBridge.synapseBridge_Querys import queryBridgeableTokens
from src.tokens.tokens_Query import getTokenBySymbolAndChainID
from src.tokens.tokens_Parse import parseTokenLists
from src.utils.data.data_Booleans import strToBool
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

def parseDexTokenLists(chainRecipe, chainName, chainId):

    chainLocalTokenListURL = getTokenListFileFromGitlab(
        chainName=chainName
    )

    chainExternalTokenList = getTokenListURLsFromGitlab(
        path=f"{chainName}/common/external/external.json"
    )

    for dexName, dexDetails in chainRecipe["dexs"].items():

        dexTokenList = getTokenListURLsFromGitlab(
            path=f"{chainName}/{dexName}/external/external.json"
        )

        tokenListURLs = chainExternalTokenList + dexTokenList

        tokenListURLs.append(chainLocalTokenListURL)

        dexDetails["tokenList"] = parseTokenLists(
            tokenListURLs=tokenListURLs,
            chainId = chainId
        )

    return chainRecipe

