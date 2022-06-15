import json, os, sys, logging
from src.utils.general import get_project_root, percentage

logger = logging.getLogger("DFK-DEX")

# Get the wei amount of a value from int value
def getTokenDecimalValue(amount, decimalPlaces=18):
    return str(format(float(amount) * (10 ** decimalPlaces), f'.0f'))

# Get the int amount of a value from wei value
def getTokenNormalValue(amount, decimalPlaces=18):
    return str(format(float(amount) / (10 ** decimalPlaces), f'.{decimalPlaces}f'))

# Get the ABI file for a uniswap contract
def getABI(file, folder="abi"):

    return getJSONFile(folder, file, section="abi", asStr=True)

def getJSONFile(folder, file, section=None, asStr=False):
    jsonPath = os.path.join(get_project_root().parents[0], "data", folder, file)

    jsonFile = open(jsonPath)

    if asStr:
        if section:
            return json.dumps(((json.load(jsonFile))[section]))
        else:
            return json.dumps((json.load(jsonFile)))
    else:
        if section:
            return (json.load(jsonFile))[section]
        else:
            return json.load(jsonFile)


# Get the opposite arb direction
def getOppositeDirection(direction):

    if direction == "origin":
        return "destination"
    else:
        return "origin"

# Get a value with a percentage of slippage
def getValueWithSlippage(amount, slippage=0.5):
    return int(format(amount - percentage(slippage, amount), f'.0f'))

# Check if stables are on origin network
def checkIfStablesAreOnOrigin(recipe):
    return recipe["origin"]["wallet"]["balances"]["stablecoin"] > recipe["destination"]["wallet"]["balances"]["stablecoin"]

# Generate a block explorer link fro a url and tx
def generateBlockExplorerLink(url, txid):
    return url + "/" + str(txid)

def checkWalletsMatch(recipe):
    if recipe["origin"]["wallet"]["address"] != recipe["destination"]["wallet"]["address"]:
        errMsg = f'originWalletAddress [{recipe["origin"]["wallet"]["address"]}] did not match destinationWalletAddress [{recipe["destination"]["wallet"]["address"]}] this should never happen!'
        logger.error(errMsg)
        sys.exit(errMsg)