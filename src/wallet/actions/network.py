import logging, os, sys
from web3 import Web3

from src.wallet.queries.network import getPrivateKey, getWalletGasBalance
from src.utils.chain import getTokenDecimalValue, generateBlockExplorerLink

# Set up our logging
logger = logging.getLogger("DFK-DEX")

# Send a raw transaction
def sendRawTransaction(rpcURL, transaction):

    w3 = Web3(Web3.HTTPProvider(rpcURL))

    privateKey = getPrivateKey()

    try:
        signedTransaction = w3.eth.account.sign_transaction(transaction, private_key=privateKey)
        sentTransaction = w3.eth.sendRawTransaction(signedTransaction.rawTransaction)
        return sentTransaction.hex()
    except ValueError as transactionError:
        logger.error(f"An error occured when sending raw transaction: {transactionError}")
        raise

def signAndSendTransaction(tx, rpcURL, txTimeoutSeconds, explorerUrl):

    # Setup our web3 object
    w3 = Web3(Web3.HTTPProvider(rpcURL))
    privateKey = getPrivateKey()
    walletAddress = w3.eth.account.privateKeyToAccount(privateKey).address
    w3.eth.default_account = walletAddress

    logger.debug("Signing transaction...")
    signed_tx = w3.eth.account.sign_transaction(tx, private_key=privateKey)
    logger.debug("Transaction signed!")

    logger.info("Sending transaction...")
    w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    logger.info("Transaction successfully sent!")

    logger.info(f"Waiting for transaction to be mined...")
    txReceipt = w3.eth.wait_for_transaction_receipt(transaction_hash=signed_tx.hash, timeout=txTimeoutSeconds,
                                                     poll_latency=2)

    explorerLink = generateBlockExplorerLink(explorerUrl, signed_tx.hash.hex())
    logger.info(f"Transaction was mined!")

    wasSuccessful = txReceipt["status"] == 1

    if wasSuccessful:
        logger.info(f"✅ Transaction was successful!")
        logger.info(f"{explorerLink}")
        result = {
            "wasSuccessful": txReceipt["status"] == 1,
            "txReceipt": txReceipt,
            "explorerLink": explorerLink,
            "hash": signed_tx.hash.hex(),
            "gasUsed": txReceipt["gasUsed"]
        }

        return result

    else:
        errMsg = f"⛔️ Transaction was unsuccessful: {explorerLink}"
        logger.error(errMsg)
        sys.exit(errMsg)

def topUpWalletGas(recipe, direction, toSwapFrom):
    from src.wallet.actions.swap import swapToken

    minimumGasBalance = float(os.environ.get("MIN_GAS_BALANCE"))
    maximumGasBalance = float(os.environ.get("MAX_GAS_BALANCE"))

    fromAddress = recipe[direction][toSwapFrom]["address"]
    toAddress = recipe[direction]["gas"]["address"]

    gasBalance = recipe[direction]["wallet"]["balances"]["gas"]

    fromPrice = recipe[direction][toSwapFrom]["price"]
    gasPrice = recipe[direction]["gas"]["price"]

    fromBalanceValue = recipe[direction]["wallet"]["balances"][toSwapFrom] * fromPrice

    needsGas = gasBalance < minimumGasBalance

    if needsGas:
        gasTokensNeeded = maximumGasBalance - gasBalance
        topUpCost = gasTokensNeeded * gasPrice

        amountIn = topUpCost / fromPrice

        if topUpCost > fromBalanceValue:
            errMsg = f'Error topping up {direction} ({recipe[direction]["chain"]["name"]}) wallet with gas: Not enough stables (balance: {fromBalanceValue}) to purchase {gasTokensNeeded} {recipe[direction]["gas"]["symbol"]} for {topUpCost} {recipe[direction]["stablecoin"]["symbol"]}'
            logger.error(errMsg)
            sys.exit(errMsg)

        logger.info(f'{direction} wallet ({recipe[direction]["chain"]["name"]}) needs gas - adding {gasTokensNeeded} {recipe[direction]["gas"]["symbol"]} for {topUpCost} {recipe[direction]["stablecoin"]["symbol"]}')

        try:

            amountInWei = int(getTokenDecimalValue(amountIn, recipe[direction][toSwapFrom]["decimals"]))

            result = swapToken(
                amountInNormal=amountInWei,
                amountInDecimals=recipe[direction][toSwapFrom]["decimals"],
                amountOutNormal=gasTokensNeeded,
                amountOutDecimals=18,
                tokenPath=[fromAddress, toAddress],
                rpcURL=recipe[direction]["chain"]["rpc"],
                explorerUrl=recipe[direction]["chain"]["blockExplorer"],
                routerAddress=recipe[direction]["chain"]["uniswapRouter"],
                txDeadline=300,
                txTimeoutSeconds=150,
                swappingToGas=True
            )

        except Exception as err:
            errMsg = f'Error topping up {direction} ({recipe[direction]["chain"]["name"]}) wallet with gas: {err}'
            logger.error(errMsg)
            sys.exit(errMsg)

        recipe[direction]["wallet"]["balances"]["gas"] = getWalletGasBalance(
            recipe[direction]["chain"]["rpc"],
            recipe[direction]["wallet"]["address"]
        )

        logger.info(f'{direction} wallet ({recipe[direction]["chain"]["name"]}) topped up successful - new balance is {recipe[direction]["wallet"]["balances"]["gas"]} {recipe[direction]["gas"]["symbol"]}')
    else:
        logger.info(f"Origin wallet has enough gas")

    return recipe