import logging
import sys
import time
from web3 import Web3
import dex.uniswap_v2_router as market_place_router
import dex.erc20 as erc20
from retry import retry
from dotenv import load_dotenv

load_dotenv()
import os

# Retry Envs
transactionRetryLimit = int(os.environ.get("TRANSACTION_RETRY_LIMIT"))
transactionRetryDelay = int(os.environ.get("TRANSACTION_RETRY_DELAY"))

# Set up our logging
log_format = '%(asctime)s|%(name)s|%(levelname)s: %(message)s'
logger = logging.getLogger("DFK-DEX")
logger.setLevel(logging.DEBUG)
logging.basicConfig(level=logging.INFO, format=log_format, stream=sys.stdout)

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def swapToken(tokenToSwapFrom, tokenToSwapTo, amountToSwap, rpcURL, privateKey, timeout=180, gwei=30):

    # Connect to our RPC.
    rpc_server = rpcURL
    w3 = Web3(Web3.HTTPProvider(rpc_server))
    logger.info("Using RPC server " + rpc_server)
    transactionTimeout = int(time.time() + timeout)

    # Get wallet address from private key.
    account_address = w3.eth.account.privateKeyToAccount(privateKey).address

    # Get the address of the token we to swap from.
    originTokenAddress = erc20.symbol2address(tokenToSwapFrom)

    # If we declare "GAS" as the token we want to swap to, will we the native gas token of
    # the chain eg. if were on Harmony, it would be ONE.
    if tokenToSwapTo == "GAS":
        destinationTokenAddress = market_place_router.weth(rpc_server)
        market_place_router.swap_exact_tokens_for_eth(
            amount_in=erc20.eth2wei(w3, amountToSwap),
            amount_out_min=60,
            path=[originTokenAddress, destinationTokenAddress],
            to=account_address,
            deadline=transactionTimeout,
            private_key=privateKey,
            nonce=w3.eth.getTransactionCount(account_address),
            gas_price_gwei=w3.fromWei(w3.eth.gas_price, 'gwei'),
            tx_timeout_seconds=transactionTimeout,
            rpc_address=rpc_server,
            logger=logger
        )

    # Otherwise we will swap the source token for the same amount of the destination token.
    else:
        destinationTokenAddress = erc20.symbol2address(tokenToSwapTo)
        market_place_router.swap_exact_tokens_for_tokens(
            amount_in=erc20.eth2wei(w3, amountToSwap),
            amount_out_min=60,
            path=[originTokenAddress, destinationTokenAddress],
            to=account_address,
            deadline=transactionTimeout,
            private_key=privateKey,
            nonce=w3.eth.getTransactionCount(account_address),
            gas_price_gwei=w3.fromWei(w3.eth.gas_price, 'gwei'),
            tx_timeout_seconds=transactionTimeout,
            rpc_address=rpc_server,
            logger=logger
        )

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def getTokenBalance(rpcURL, walletAddress, token):

    rpc_server = rpcURL
    logger.info("Using RPC server " + rpc_server)

    w3 = Web3(Web3.HTTPProvider(rpc_server))

    token_address = erc20.symbol2address(token)

    tokenName = erc20.address2symbol(token_address)

    name = erc20.name(token_address, rpc_server)
    symbol = erc20.symbol(token_address, rpc_server)
    balance = erc20.wei2eth(w3, erc20.balance_of(walletAddress, token_address, rpc_server))
    logger.info(name + " -> " + str(balance) + " " + symbol)

    return balance

testWallet = "0x919d17174Fb22CC1Cfc8748C208104EC62341791"
balance = getTokenBalance(os.environ.get("HARMONY_MAIN_RPC"), testWallet, "JEWEL")
x = 1
# swapToken(
#     tokenToSwapFrom="JEWEL",
#     tokenToSwapTo="GAS",
#     amountToSwap=23423423.00002502783,
#     rpcURL=os.environ.get("HARMONY_MAIN_RPC"),
#     privateKey=os.environ.get("NOHACKERSALLOWED"),
#     timeout=180,
#     gwei=30
# )

# swapToken(
#     tokenToSwapFrom="JEWEL",
#     tokenToSwapTo="GAS",
#     amountToSwap=23423423.00002502783,
#     rpcURL=os.environ.get("HARMONY_MAIN_RPC"),
#     privateKey=os.environ.get("NOHACKERSALLOWED"),
#     timeout=180,
#     gwei=30
# )