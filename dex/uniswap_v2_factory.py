"""
https://docs.uniswap.org/protocol/V2/reference/smart-contracts/factory
"""

from web3 import Web3
from helpers import Utils

ABI = Utils.getABI("IUniswapV2Factory.json")

def all_pairs_length(rpc_address, factoryAddress):

    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(factoryAddress)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.allPairsLength().call()


def all_pairs(index, rpc_address, factoryAddress):
    '''
    Return the address of the liquidity pair at index
    :param index:
    :param rpc_address:
    :return:
    '''
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(factoryAddress)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.allPairs(index).call()


def get_pair(token_address_1, token_address_2, rpc_address, factoryAddress):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(factoryAddress)
    contract = w3.eth.contract(contract_address, abi=ABI)

    pairAddress = contract.functions.getPair(token_address_1, token_address_2).call()

    return pairAddress