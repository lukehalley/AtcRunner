import json
import sys
import pathlib

from web3 import Web3

import os

ROOT_DIR = (pathlib.Path(os.path.abspath(os.curdir))).parent

# Opening JSON file

ITEMS = json.load(open(os.path.abspath(f'{ROOT_DIR}/dex/items.json')))
ABI = json.load(open(os.path.abspath(f'{ROOT_DIR}/dex/abi.json')))

def wei2eth(w3, wei):
    return w3.fromWei(wei, 'ether')


def eth2wei(w3, eth):
    return w3.toWei(eth, 'ether')


def symbol2address(symbol):
    symbol = symbol.upper().strip()
    address = ITEMS[symbol]["address"]

    if address:
        return address
    else:
        sys.exit(f"No item reference for {symbol}")


def address2symbol(address):
    address = address.strip()
    result = None

    for key, value in ITEMS.items():
        if address == value["address"]:
            result = key
            return result

    if not result:
        sys.exit(f"No address reference for {address}")


def all_items():
    return ITEMS.copy()


def symbol(token_address, rpc_address):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(token_address)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.symbol().call()


def name(token_address, rpc_address):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(token_address)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.name().call()


def decimals(token_address, rpc_address):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(token_address)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.decimals().call()


def balance_of(address, token_address, rpc_address):
    w3 = Web3(Web3.HTTPProvider(rpc_address))
    contract_address = Web3.toChecksumAddress(token_address)
    contract = w3.eth.contract(contract_address, abi=ABI)
    result = contract.functions.balanceOf(address).call()

    return result
