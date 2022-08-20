from web3 import Web3

def allPairsLength(rpc_address, factoryAddress, factoryABI):

    web3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(factoryAddress)
    contract = web3.eth.contract(contract_address, abi=factoryABI)

    return contract.functions.allPairsLength().call()

def allPairs(index, rpc_address, factoryAddress, factoryABI):
    web3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(factoryAddress)
    contract = web3.eth.contract(contract_address, abi=factoryABI)

    return contract.functions.allPairs(index).call()

def getPair(token_address_1, token_address_2, rpc_address, factoryAddress, factoryABI):
    web3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(factoryAddress)
    contract = web3.eth.contract(contract_address, abi=factoryABI)

    pairAddress = contract.functions.getPair(token_address_1, token_address_2).call()

    return pairAddress