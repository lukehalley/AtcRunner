import logging, sys
from web3 import Web3

from src.utils.chain import getABI, generateBlockExplorerLink, getTokenNormalValue

# Set up our logging
logger = logging.getLogger("DFK-DEX")

def swapToken(tokenToSwapFrom, tokenToSwapTo, amountInWei, amountOutMinWei, tokenPath, addressTo, txDeadline, txTimeoutSeconds, rpcURL, routerAddress, explorerUrl, swappingToGas=False, gas=250000):
    from src.wallet.queries.network import getPrivateKey

    # Setup our web3 object
    w3 = Web3(Web3.HTTPProvider(rpcURL))
    privateKey = getPrivateKey()
    account = w3.eth.account.privateKeyToAccount(privateKey).address
    w3.eth.default_account = account.address

    # Get general settings for our transaction
    nonce = w3.eth.getTransactionCount(account)
    gasPriceWei = w3.fromWei(w3.eth.gas_price, 'gwei')

    # Get both origin and destination token address
    originTokenAddress = w3.toChecksumAddress(tokenToSwapFrom)
    destinationTokenAddress = w3.toChecksumAddress(tokenToSwapTo)

    # Get properties for our swap contract
    ABI = getABI("IUniswapV2Router02.json")
    contract = w3.eth.contract(routerAddress, abi=ABI)

    txParams = {
        'gasPrice': w3.toWei(gasPriceWei, 'gwei'),
        'nonce': nonce,
        'gas': gas
    }

    if swappingToGas:
        tx = contract.functions.swapExactTokensForETH(amountInWei, amountOutMinWei, tokenPath, addressTo, txDeadline).buildTransaction(txParams)
    else:
        tx = contract.functions.swapExactTokensForTokens(amountInWei, amountOutMinWei, tokenPath, addressTo, txDeadline).buildTransaction(txParams)

    logger.debug("Signing transaction...")
    signed_tx = w3.eth.account.sign_transaction(tx, private_key=privateKey)
    logger.debug("Transaction signed!")

    logger.info("Sending transaction...")
    w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    logger.info("Transaction successfully sent!")

    logger.info("Waiting for transaction addressTo be mined...")
    tx_receipt = w3.eth.wait_for_transaction_receipt(transaction_hash=signed_tx.hash, timeout=txTimeoutSeconds,
                                                     poll_latency=2)

    explorerLink = generateBlockExplorerLink(explorerUrl, signed_tx.hash.hex())
    logger.info(f"Transaction was mined: {explorerLink}")

    txWasSuccessful = tx_receipt["status"] == 1

    if txWasSuccessful:
        logger.info(f"✅ Transaction was successful: {explorerLink}")

        result = {
            "successfull": txWasSuccessful,
            "fee": getTokenNormalValue(tx_receipt["gasUsed"] * w3.toWei(gasPriceWei, 'gwei'), 18),
            "blockURL": explorerLink,
            "hash": signed_tx.hash.hex()
        }

    else:
        errMsg = f'⛔️ Transaction was unsuccessful: {explorerLink}'
        logger.error(errMsg)
        sys.exit(errMsg)

    return result