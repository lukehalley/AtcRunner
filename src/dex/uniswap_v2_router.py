import logging
import os
import sys

from retry import retry
from web3 import Web3

# from src.utils.chain import getABI

logger = logging.getLogger("DFK-DEX")
# abi = getABI("IUniswapV2Router02.json")

# Retry Envs
httpRetryLimit = int(os.environ.get("HTTP_RETRY_LIMIT"))
httpRetryDelay = int(os.environ.get("HTTP_RETRY_DELAY"))

@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def weth(rpc_address, routerAddress, abi):
    '''
    Return the wrapped address of the native token of the blockchain
    :param rpc_address:
    :return:
    '''

    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(routerAddress)
    contract = w3.eth.contract(contract_address, abi=abi)

    return contract.functions.WETH().call()

@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def factory(rpc_address, routerAddress, abi):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(routerAddress)
    contract = w3.eth.contract(contract_address, abi=abi)

    return contract.functions.factory().call()


def quote(amount_a, reserve_a, reserve_b, rpc_address, routerAddress, abi):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(routerAddress)
    contract = w3.eth.contract(contract_address, abi=abi)

    return contract.functions.quote(amount_a, reserve_a, reserve_b).call()

@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def get_amount_in(amount_out, reserve_in, reserve_out, rpc_address, routerAddress, abi):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(routerAddress)
    contract = w3.eth.contract(contract_address, abi=abi)

    return contract.functions.getAmountIn(amount_out, reserve_in, reserve_out).call()

@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def get_amounts_in(amount_out, addresses, rpc_address, routerAddress, abi):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    hasDuplicateAddresses = len(addresses) != len(set(addresses))

    if not hasDuplicateAddresses:

        contract_address = Web3.toChecksumAddress(routerAddress)
        contract = w3.eth.contract(contract_address, abi=abi)

        return contract.functions.getAmountsIn(amount_out, addresses).call()

    else:

        sys.exit(f"getAmountsIn - has duplicate addresses: {addresses}")

@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def get_amount_out(amount_out, reserve_in, reserve_out, rpc_address, routerAddress, abi):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(routerAddress)
    contract = w3.eth.contract(contract_address, abi=abi)

    return contract.functions.getAmountOut(amount_out, reserve_in, reserve_out).call()

# @retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def get_amounts_out(amount_in, addresses, rpc_address, routerAddress, abi):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    hasDuplicateAddresses = len(addresses) != len(set(addresses))

    if not hasDuplicateAddresses:

        contract_address = Web3.toChecksumAddress(routerAddress)

        contract = w3.eth.contract(contract_address, abi=abi)

        if "getAmountsOut" in str(contract.all_functions()):
            try:
                quote = contract.functions.getAmountsOut(amount_in, addresses).call()
                outcome = "ok"
                return quote, outcome
            except:
                outcome = "Transaction Reverted ⚠️"
                return [0, 0, 0], outcome
        else:
            outcome = "getAmountsOut Missing ⁉️"
            return [0, 0, 0], outcome

    else:

        sys.exit(f"get_amounts_out - has duplicate addresses: {addresses}")





