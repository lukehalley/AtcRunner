import logging, os, sys, json
from decimal import Decimal
from retry import retry
from web3 import Web3

from src.wallet.queries.network import getPrivateKey, getWalletGasBalance
from src.utils.chain import generateBlockExplorerLink, getValueWithSlippage
from src.utils.general import getCurrentDateTime
from src.api.telegrambot import updatedStatusMessage
from src.api.firebase import writeTransactionToDB

from src.wallet.queries.network import getTokenBalance
from src.api.telegrambot import sendMessage

# Set up our logging
logger = logging.getLogger("DFK-DEX")

transactionRetryLimit = int(os.environ.get("TRANSACTION_RETRY_LIMIT"))
transactionRetryDelay = int(os.environ.get("TRANSACTION_RETRY_DELAY"))

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def signAndSendTransaction(tx, rpcURL, txTimeoutSeconds, explorerUrl, arbitrageNumber, stepCategory, telegramStatusMessage):

    # Setup our web3 object
    w3 = Web3(Web3.HTTPProvider(rpcURL))
    privateKey = getPrivateKey()
    walletAddress = w3.eth.account.privateKeyToAccount(privateKey).address
    w3.eth.default_account = walletAddress

    tx["nonce"] = w3.eth.getTransactionCount(walletAddress, 'pending')

    telegramStatusMessage = updatedStatusMessage(originalMessage=telegramStatusMessage, newStatus="⏳")

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

    result = {
        "wasSuccessful": txReceipt["status"] == 1,
        "explorerLink": explorerLink,
        "hash": signed_tx.hash.hex(),
        "gasUsed": txReceipt["gasUsed"],
        "dateTime": getCurrentDateTime()
    }

    writeTransactionToDB(
        transaction=result,
        arbitrageNumber=arbitrageNumber,
        stepCategory=stepCategory
    )

    result["telegramStatusMessage"] = telegramStatusMessage

    if wasSuccessful:
        logger.info(f"✅ Transaction was successful!")
        logger.info(f"{explorerLink}")
        return result

    else:
        errMsg = f"⛔️ Transaction was unsuccessful: {explorerLink}"
        if telegramStatusMessage:
            updatedStatusMessage(originalMessage=telegramStatusMessage, newStatus="⛔️")
        logger.error(errMsg)
        raise Exception(errMsg)

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def topUpWalletGas(recipe, direction, toSwapFrom):
    from src.wallet.queries.swap import getSwapQuoteIn
    from src.wallet.actions.swap import swapToken

    minimumGasBalance = Decimal(os.environ.get("MIN_GAS_BALANCE"))
    maximumGasBalance = Decimal(os.environ.get("MAX_GAS_BALANCE"))

    gasBalance = recipe[direction]["wallet"]["balances"]["gas"]

    needsGas = gasBalance < minimumGasBalance

    balanceBeforeBridge = getTokenBalance(
        rpcURL=recipe[direction]["chain"]["rpc"],
        tokenAddress=recipe[direction][toSwapFrom]["address"],
        tokenDecimals=recipe[direction][toSwapFrom]["decimals"]
    )

    if direction == "origin":
        gasTopUpCategory = f"gas_1"
    else:
        gasTopUpCategory = f"gas_2"

    if needsGas:
        gasTokensNeeded = maximumGasBalance - gasBalance

        routes = [recipe[direction][toSwapFrom]["address"], recipe[direction]["gas"]["address"]]

        amountInQuoted = getSwapQuoteIn(
            amountOutNormal=gasTokensNeeded,
            amountOutDecimals=recipe[direction][toSwapFrom]["decimals"],
            amountInDecimals=recipe[direction][toSwapFrom]["decimals"],
            rpcUrl=recipe[direction]["chain"]["rpc"],
            routerAddress=recipe[direction]["chain"]["uniswapRouter"],
            routes=routes
        )

        amountOutMinWithSlippage = getValueWithSlippage(amount=gasTokensNeeded, slippage=0.5)

        if amountInQuoted > balanceBeforeBridge:
            errMsg = f'Error topping up {direction} ({recipe[direction]["chain"]["name"]}) wallet with gas: ' \
                     f'Not enough {toSwapFrom}s (balance: {balanceBeforeBridge}) to purchase {gasTokensNeeded} {recipe[direction]["gas"]["symbol"]} ' \
                     f'for {amountInQuoted} {recipe[direction][toSwapFrom]["symbol"]}'
            logger.error(errMsg)
            raise Exception(errMsg)

        logger.info(f'{direction} wallet ({recipe[direction]["chain"]["name"]}) needs gas - adding {gasTokensNeeded} {recipe[direction]["gas"]["symbol"]} for {amountInQuoted} {recipe[direction][toSwapFrom]["symbol"]}')

        try:

            telegramStatusMessage = sendMessage(msg=f"Topping Up {direction.title()} Wallet -> ️")

            result = swapToken(
                amountInNormal=amountInQuoted,
                amountInDecimals=recipe[direction][toSwapFrom]["decimals"],
                amountOutNormal=amountOutMinWithSlippage,
                amountOutDecimals=18,
                tokenPath=routes,
                rpcURL=recipe[direction]["chain"]["rpc"],
                arbitrageNumber=recipe["arbitrage"]["currentRoundTripCount"],
                stepCategory=gasTopUpCategory,
                telegramStatusMessage=telegramStatusMessage,
                explorerUrl=recipe[direction]["chain"]["blockExplorer"],
                routerAddress=recipe[direction]["chain"]["uniswapRouter"],
                txDeadline=300,
                txTimeoutSeconds=150,
                swappingToGas=True
            )

            updatedStatusMessage(originalMessage=result["telegramStatusMessage"], newStatus="✅")

            x = 1

        except Exception as err:
            errMsg = f'Error topping up {direction} ({recipe[direction]["chain"]["name"]}) wallet with gas: {err}'
            logger.error(errMsg)
            sys.exit(err)

        recipe[direction]["wallet"]["balances"]["gas"] = getWalletGasBalance(
            recipe[direction]["chain"]["rpc"],
            recipe[direction]["wallet"]["address"]
        )

        logger.info(f'{direction} wallet ({recipe[direction]["chain"]["name"]}) topped up successful - new balance is {recipe[direction]["wallet"]["balances"]["gas"]} {recipe[direction]["gas"]["symbol"]}')

    return recipe