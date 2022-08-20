from web3 import Web3

from src.utils.logging.logging_Setup import getProjectLogger


logger = getProjectLogger()

def convertWeiToETH(web3, wei):
    return web3.fromWei(wei, 'ether')

def convertETHToWei(web3, eth):
    return web3.toWei(eth, 'ether')

def getTokenSymbol(token_address, rpc_address, wethContractABI):
    web3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(token_address)
    contract = web3.eth.contract(contract_address, abi=wethContractABI)

    return contract.functions.symbol().call()

def getTokenName(token_address, rpc_address, wethContractABI):
    web3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(token_address)
    contract = web3.eth.contract(contract_address, abi=wethContractABI)

    return contract.functions.name().call()

def getTokenDecimals(token_address, rpc_address, wethContractABI):
    web3 = Web3(Web3.HTTPProvider(rpc_address))

    contract_address = Web3.toChecksumAddress(token_address)
    contract = web3.eth.contract(contract_address, abi=wethContractABI)

    return contract.functions.decimals().call()

def getBalanceOfToken(address, rpc_address, wethContractABI, token_address="", getGasTokenBalance=False):

    web3 = Web3(Web3.HTTPProvider(rpc_address))

    if getGasTokenBalance:
        result = web3.eth.get_balance(address)
    else:
        contract_address = Web3.toChecksumAddress(token_address)
        contract = web3.eth.contract(contract_address, abi=wethContractABI)
        result = contract.functions.balanceOf(address).call()

    return result
