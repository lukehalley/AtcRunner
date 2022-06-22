from web3 import Web3

def getWeiFamily(decimal):
    decimal = int("1" + str("0" * decimal))
    decimalsDict = {"wei": 1,
                    "kwei": 1000,
                    "babbage": 1000,
                    "femtoether": 1000,
                    "mwei": 1000000,
                    "lovelace": 1000000,
                    "picoether": 1000000,
                    "gwei": 1000000000,
                    "shannon": 1000000000,
                    "nanoether": 1000000000,
                    "nano": 1000000000,
                    "szabo": 1000000000000,
                    "microether": 1000000000000,
                    "micro": 1000000000000,
                    "finney": 1000000000000000,
                    "milliether": 1000000000000000,
                    "milli": 1000000000000000,
                    "ether": 1000000000000000000,
                    "kether": 1000000000000000000000,
                    "grand": 1000000000000000000000,
                    "mether": 1000000000000000000000000,
                    "gether": 1000000000000000000000000000,
                    "tether": 1000000000000000000000000000000}

    key_list = list(decimalsDict.keys())
    val_list = list(decimalsDict.values())

    position = val_list.index(decimal)
    return key_list[position]

# Get the wei amount of a value from int value
def getTokenDecimalValue(amount, decimalPlaces=18):
    family = getWeiFamily(decimalPlaces)
    return int(Web3.toWei(amount, family))

# Get the int amount of a value from wei value
def getTokenNormalValue(amount, decimalPlaces=18):
    family = getWeiFamily(decimalPlaces)
    return float(Web3.fromWei(amount, family))
