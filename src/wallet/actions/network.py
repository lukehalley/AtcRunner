import logging
import os
from decimal import Decimal

from retry import retry
from web3 import Web3

from src.api.firebase import writeTransactionToDB
from src.api.telegrambot import appendToMessage
from src.api.telegrambot import updateStatusMessage
from src.utils.chain import generateBlockExplorerLink, getValueWithSlippage
from src.utils.general import getCurrentDateTime, printSeperator
from src.wallet.queries.network import getPrivateKey, getWalletGasBalance, getTokenApprovalStatus
from src.wallet.queries.network import getTokenBalance, getWalletsInformation

from web3 import exceptions
from web3.middleware import geth_poa_middleware

# Set up our logging
logger = logging.getLogger("DFK-DEX")

transactionTimeout = int(os.environ.get("TRANSACTION_TIMEOUT_SECS"))
transactionRetryLimit = int(os.environ.get("TRANSACTION_ACTION_RETRY_LIMIT"))
transactionRetryDelay = int(os.environ.get("TRANSACTION_ACTION_RETRY_DELAY"))

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def signAndSendTransaction(tx, rpcURL, explorerUrl, arbitrageNumber, stepCategory, telegramStatusMessage):

    # Setup our web3 object
    w3 = Web3(Web3.HTTPProvider(rpcURL))
    privateKey = getPrivateKey()
    walletAddress = w3.eth.account.privateKeyToAccount(privateKey).address
    w3.eth.default_account = walletAddress

    initNonce = w3.eth.getTransactionCount(walletAddress, 'pending')

    tx["nonce"] = initNonce

    telegramStatusMessage = updateStatusMessage(originalMessage=telegramStatusMessage, newStatus="⏳")

    printSeperator()

    logger.info(f'Transaction Details:')
    logger.info(f'Value: {tx["value"]}')
    logger.info(f'Chain ID: {tx["chainId"]}')
    logger.info(f'Nonce: {tx["nonce"]}')
    logger.info(f'To: {tx["to"]}')
    logger.info(f'Gas Limit: {tx["gas"]}')
    logger.info(f'Gas Price: {tx["gasPrice"]}')

    printSeperator()

    logger.debug("Signing transaction...")
    signed_tx = w3.eth.account.sign_transaction(tx, private_key=privateKey)
    logger.debug("Transaction signed!")

    logger.info("Sending transaction...")
    try:
        w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    except Exception as e:
        isKnownTransactionError = "known transaction" in e.args[0]["message"]
        isNonceTooLowError = "nonce too low" in e.args[0]["message"]
        if isKnownTransactionError:
            logger.warning("Hit isKnownTransactionError but going ahead...")
            pass
        elif isNonceTooLowError:
            logger.info(f"Nonce too low ({initNonce}) error caught...")
            actualNonce = w3.eth.getTransactionCount(walletAddress, 'pending')
            while actualNonce <= tx["nonce"]:
                actualNonce = w3.eth.getTransactionCount(walletAddress, 'pending')
            tx["nonce"] = actualNonce
            signed_tx = w3.eth.account.sign_transaction(tx, private_key=privateKey)
            logger.info("Nonce too low error solved - sending again...")
            w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        else:
             raise Exception(e.args[0]["message"])
    logger.info("Transaction successfully sent!")

    explorerLink = generateBlockExplorerLink(explorerUrl, signed_tx.hash.hex())

    logger.info(f"{explorerLink}")

    logger.info(f"Waiting for transaction to be mined...")

    try:
        txReceipt = w3.eth.wait_for_transaction_receipt(transaction_hash=signed_tx.hash, poll_latency=2,
                                                        timeout=transactionTimeout)
    except exceptions.TimeExhausted:
        raise Exception("Wait for transaction receipt timed out!")
    except Exception as error:
        errorText = error.args[0]["message"]
        isBadResponseError = "The response was in an unexpected format and unable to be parsed" in errorText
        if isBadResponseError:
            retryLimit = 10
            retryCount = 0
            txReceipt = w3.eth.wait_for_transaction_receipt(transaction_hash=signed_tx.hash, poll_latency=2,
                                                            timeout=transactionTimeout)
            while "status" not in txReceipt:
                if retryCount <= retryLimit:
                    txReceipt = w3.eth.wait_for_transaction_receipt(transaction_hash=signed_tx.hash,
                                                                    timeout=transactionTimeout,
                                                                    poll_latency=2)
                    retryCount = retryCount + 1
                else:
                    raise Exception(f"Unable to get a valid transaction receipt after {retryCount} tries: {errorText}")
        else:
            raise Exception(f"Unknown error while trying to get valid transaction receipt: {errorText}")
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
        return result

    else:
        errMsg = f"⛔️ Transaction was unsuccessful!"
        if telegramStatusMessage:
            updateStatusMessage(originalMessage=telegramStatusMessage, newStatus="⛔️")
        raise Exception(errMsg)

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def topUpWalletGas(recipe, direction, toSwapFrom, telegramStatusMessage):
    from src.wallet.queries.swap import getSwapQuoteIn
    from src.wallet.actions.swap import swapToken

    minimumGasBalance = Decimal(recipe[direction]["chain"]["gasDetails"]["gasLimits"]["minGas"])
    maximumGasBalance = Decimal(recipe[direction]["chain"]["gasDetails"]["gasLimits"]["maxGas"])

    gasBalance = recipe[direction]["wallet"]["balances"]["gas"]

    needsGas = gasBalance < minimumGasBalance

    balanceBeforeBridge = getTokenBalance(
        rpcURL=recipe[direction]["chain"]["rpc"],
        tokenAddress=recipe[direction][toSwapFrom]["address"],
        tokenDecimals=recipe[direction][toSwapFrom]["decimals"],
        wethContractABI=recipe[direction]["chain"]["contracts"]["weth"]["abi"]
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
            routerAddress=recipe[direction]["chain"]["contracts"]["router"]["address"],
            routerABI=recipe[direction]["chain"]["contracts"]["router"]["abi"],
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

            telegramStatusMessage = appendToMessage(originalMessage=telegramStatusMessage,
                                                    messageToAppend=f"⛽️ Topping Up {direction.title()} Wallet -> 📤")

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
                explorerUrl=recipe[direction]["chain"]["blockExplorer"]["txBaseURL"],
                routerAddress=recipe[direction]["chain"]["contracts"]["router"]["address"],
                routerABI=recipe[direction]["chain"]["contracts"]["router"]["abi"],
                wethContractABI=recipe[direction]["chain"]["contracts"]["weth"]["abi"],
                swappingFromGas=False,
                swappingToGas=True
            )

            updateStatusMessage(originalMessage=result["telegramStatusMessage"], newStatus="✅")

        except Exception as err:
            errMsg = f'Error topping up {direction} ({recipe[direction]["chain"]["name"]}) wallet with gas: {err}'
            logger.error(errMsg)
            raise Exception(err)

        recipe[direction]["wallet"]["balances"]["gas"] = getWalletGasBalance(
            rpcURL=recipe[direction]["chain"]["rpc"],
            walletAddress=recipe[direction]["wallet"]["address"],
            wethContractABI=recipe[direction]["chain"]["contracts"]["weth"]["abi"]
        )

        recipe = getWalletsInformation(recipe)

        logger.info(f'{direction} wallet ({recipe[direction]["chain"]["name"]}) topped up successful - new balance is {recipe[direction]["wallet"]["balances"]["gas"]} {recipe[direction]["gas"]["symbol"]}')

    return recipe, needsGas, telegramStatusMessage

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def callMappedContractFunction(contract, functionToCall, functionParams=None):

    if functionParams:
        result = getattr(contract.functions, functionToCall)(*functionParams).call()
    else:
        result = getattr(contract.functions, functionToCall)().call()

    return result

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def buildMappedContractFunction(contract, functionToCall, txParams, functionParams=None):

    if functionParams:
        result = getattr(contract.functions, functionToCall)(*functionParams).buildTransaction(txParams)
    else:
        result = getattr(contract.functions, functionToCall)().buildTransaction(txParams)

    return result

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def approveToken(rpcUrl, explorerUrl, walletAddress, tokenAddress, spenderAddress, wethAbi, arbitrageNumber, stepCategory, telegramStatusMessage):

    web3 = Web3(Web3.HTTPProvider(rpcUrl))
    web3.middleware_onion.inject(geth_poa_middleware, layer=0)

    tokenAddressCS = web3.toChecksumAddress(tokenAddress)
    tokenToApproveContract = web3.eth.contract(address=tokenAddressCS, abi=wethAbi)

    amountToApprove = web3.toWei(2 ** 64 - 1, 'ether')
    nonce = web3.eth.getTransactionCount(walletAddress, 'pending')

    tx = tokenToApproveContract.functions.approve(spenderAddress, amountToApprove).buildTransaction({
        'from': walletAddress,
        'nonce': nonce,
        'gasPrice': web3.eth.gas_price,
    })

    signAndSendTransaction(tx=tx, rpcURL=rpcUrl, explorerUrl=explorerUrl, arbitrageNumber=arbitrageNumber, stepCategory=stepCategory, telegramStatusMessage=telegramStatusMessage)

    return telegramStatusMessage

def checkAndApproveToken(recipe, position, toSwapFrom, stepNumber, isSwap, telegramStatusMessage):

    if isSwap:
        typeText = "Swap"
        spenderAddress=recipe[position]["chain"]["contracts"]["router"]["address"]
    else:
        typeText = "Bridge"
        spenderAddress=recipe[position]["chain"]["contracts"]["bridges"]["synapse"]["address"]

    isApproved = getTokenApprovalStatus(
        rpcUrl=recipe[position]["chain"]["rpc"],
        walletAddress=recipe[position]["wallet"]["address"],
        tokenAddress=recipe[position][toSwapFrom]["address"],
        spenderAddress=spenderAddress,
        wethAbi=recipe[position]["chain"]["contracts"]["weth"]["abi"]
    )

    if not isApproved:
        printSeperator()

        logger.info(f'{stepNumber}.5 Approving {recipe[position][toSwapFrom]["symbol"]} {typeText}')
        telegramStatusMessage = appendToMessage(originalMessage=telegramStatusMessage,
                                                messageToAppend=f"{stepNumber} Approving {recipe[position][toSwapFrom]['symbol']} {typeText} 💸")

        printSeperator()

        telegramStatusMessage = approveToken(
            rpcUrl=recipe[position]["chain"]["rpc"],
            explorerUrl=recipe[position]["chain"]["blockExplorer"]["txBaseURL"],
            walletAddress=recipe[position]["wallet"]["address"],
            tokenAddress=recipe[position][toSwapFrom]["address"],
            spenderAddress=spenderAddress,
            wethAbi=recipe[position]["chain"]["contracts"]["weth"]["abi"],
            arbitrageNumber=recipe["arbitrage"]["currentRoundTripCount"],
            stepCategory=f"{stepNumber}_5_{typeText.lower()}",
            telegramStatusMessage=telegramStatusMessage
        )

        printSeperator()
        
    return telegramStatusMessage
