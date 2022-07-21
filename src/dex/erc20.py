import json
import logging
import os
import pathlib

from web3 import Web3

from src.api.firebase import fetchFromDatabase

ROOT_DIR = (pathlib.Path(os.path.abspath(os.curdir))).parent

# Set up our logging
logger = logging.getLogger("DFK-DEX")

# Opening JSON file

ABI = json.load(open('src/dex/abi.json'))

def wei2eth(w3, wei):
    return w3.fromWei(wei, 'ether')


def eth2wei(w3, eth):
    return w3.toWei(eth, 'ether')

def all_tokens():
    tokens = fetchFromDatabase("tokens")
    return tokens.copy()


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


def balance_of(address, rpc_address, token_address="", getGasTokenBalance=False):

    w3 = Web3(Web3.HTTPProvider(rpc_address))

    if getGasTokenBalance:
        result = w3.eth.get_balance(address)
    else:
        contract_address = Web3.toChecksumAddress(token_address)
        contract = w3.eth.contract(contract_address, abi=ABI)
        result = contract.functions.balanceOf(address).call()

    return result
