import json

from hexbytes import HexBytes
from web3 import Web3

from src.utils.logging.logging_Setup import getProjectLogger

logger = getProjectLogger()

class HexJsonEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, HexBytes):
            return obj.hex()
        return super().default(obj)

def checkWalletsMatch(recipe):
    if recipe["origin"]["chain"]["address"] != recipe["destination"]["chain"]["address"]:
        errMsg = f'originWalletAddress [{recipe["origin"]["chain"]["address"]}] did not match destinationWalletAddress [{recipe["destination"]["chain"]["address"]}] this should never happen!'
        logger.error(errMsg)
        raise Exception(errMsg)

def addressToChecksumAddress(address):
    return Web3.toChecksumAddress(address)

