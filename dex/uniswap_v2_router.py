from src.utils.chain import getABI

from web3 import Web3

ABI = getABI("IUniswapV2Router02.json")

def weth(rpc_address, routerAddress):
    '''
    Return the wrapped address of the native token of the blockchain
    :param rpc_address:
    :return:
    '''

    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(routerAddress)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.WETH().call()


def factory(rpc_address, routerAddress):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(routerAddress)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.factory().call()


def quote(amount_a, reserve_a, reserve_b, rpc_address, routerAddress):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(routerAddress)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.quote(amount_a, reserve_a, reserve_b).call()


def get_amount_in(amount_out, reserve_in, reserve_out, rpc_address, routerAddress):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(routerAddress)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.getAmountIn(amount_out, reserve_in, reserve_out).call()


def get_amount_out(amount_in, reserve_in, reserve_out, rpc_address, routerAddress):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(routerAddress)
    contract = w3.eth.contract(contract_address, abi=ABI)

    return contract.functions.getAmountOut(amount_in, reserve_in, reserve_out).call()



