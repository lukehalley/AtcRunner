import dex.erc20 as tokens
import logging
import sys
from web3 import Web3
import dex.erc20 as erc20

def getTokenBalance(rpcURL, walletAddress, token):
    log_format = '%(asctime)s|%(name)s|%(levelname)s: %(message)s'

    logger = logging.getLogger("DFK-erc20")
    logger.setLevel(logging.DEBUG)
    logging.basicConfig(level=logging.INFO, format=log_format, stream=sys.stdout)

    rpc_server = rpcURL
    logger.info("Using RPC server " + rpc_server)

    w3 = Web3(Web3.HTTPProvider(rpc_server))

    token_address = erc20.symbol2address(token)
    name = tokens.name(token_address, rpc_server)
    symbol = tokens.symbol(token_address, rpc_server)
    decimal = tokens.decimals(token_address, rpc_server)
    balance = tokens.balance_of(walletAddress, token_address, rpc_server)
    balance = tokens.wei2eth(w3, balance)
    logger.info(name + " -> " + str(balance) + " " + symbol)

    return balance


