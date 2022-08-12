import logging
import os
import sys

from retry import retry
from web3 import Web3

from src.wallet.actions.network import callMappedContractFunction
from src.wallet.queries.network import getMappedContractFunction

logger = logging.getLogger("DFK-DEX")

# Retry Envs
httpRetryLimit = int(os.environ.get("HTTP_RETRY_LIMIT"))
httpRetryDelay = int(os.environ.get("HTTP_RETRY_DELAY"))

@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def factory(rpc_address, routerAddress, routerABI):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(routerAddress)
    contract = w3.eth.contract(contract_address, abi=routerABI)

    return contract.functions.factory().call()

@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def quote(amount_a, reserve_a, reserve_b, rpc_address, routerAddress, routerABI):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(routerAddress)
    contract = w3.eth.contract(contract_address, abi=routerABI)

    return contract.functions.quote(amount_a, reserve_a, reserve_b).call()

@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def getAmountIn(amount_out, reserve_in, reserve_out, rpc_address, routerAddress, routerABI):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(routerAddress)
    contract = w3.eth.contract(contract_address, abi=routerABI)

    return contract.functions.getAmountIn(amount_out, reserve_in, reserve_out).call()

@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def getAmountsIn(amount_out, addresses, rpc_address, routerAddress, routerABI):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    hasDuplicateAddresses = len(addresses) != len(set(addresses))

    if not hasDuplicateAddresses:

        contract_address = Web3.toChecksumAddress(routerAddress)
        contract = w3.eth.contract(contract_address, abi=routerABI)

        return contract.functions.getAmountsIn(amount_out, addresses).call()

    else:

        raise Exception(f"getAmountsIn - has duplicate addresses: {addresses}")

@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def getAmountOut(amount_out, reserve_in, reserve_out, rpc_address, routerAddress, routerABI):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(routerAddress)
    contract = w3.eth.contract(contract_address, abi=routerABI)

    return contract.functions.getAmountOut(amount_out, reserve_in, reserve_out).call()

@retry(tries=httpRetryLimit, delay=httpRetryDelay, logger=logger)
def getAmountsOut(amount_in, addresses, rpc_address, routerAddress, routerABI, routerABIMappings):
    w3 = Web3(Web3.HTTPProvider(rpc_address))

    hasDuplicateAddresses = len(addresses) != len(set(addresses))

    if not hasDuplicateAddresses:

        contract_address = Web3.toChecksumAddress(routerAddress)
        contract = w3.eth.contract(contract_address, abi=routerABI)

        getAmountsOutFunctionName = getMappedContractFunction(functionName="getAmountsOut", abiMapping=routerABIMappings)

        params = [
            amount_in,
            addresses
        ]

        return callMappedContractFunction(contract=contract, functionToCall=getAmountsOutFunctionName, functionParams=params)

    else:

        raise Exception(f"getAmountsOut - has duplicate addresses: {addresses}")





