import sys
from decimal import Decimal

from retry import retry

from web3 import Web3
from web3 import exceptions
from web3.middleware import geth_poa_middleware

from src.apis.firebaseDB.firebaseDB_Actions import writeTransactionToDB
from src.apis.telegramBot.telegramBot_Action import updateStatusMessage, appendToMessage
from src.chain.network.network_Querys import getTokenBalance, getWalletGasBalance, getWalletsInformation, \
    getTokenApprovalStatus
from src.utils.chain.chain_Calculations import getValueWithSlippage
from src.utils.chain.chain_URLs import generateBlockExplorerLink
from src.utils.chain.chain_Wallet import getPrivateKey
from src.utils.logging.logging_Print import printSeperator

from src.utils.logging.logging_Setup import getProjectLogger
from src.utils.retry.retry_Params import getRetryParams, getTransactionTimeout
from src.utils.time.time_Calculations import getCurrentDateTime

logger = getProjectLogger()

transactionTimeout = getTransactionTimeout()
transactionRetryLimit, transactionRetryDelay, = getRetryParams(retryType="transactionAction")


@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def signAndSendTransaction(tx, rpcUrl, explorerUrl, currentRoundTrip, stepCategory, telegramStatusMessage):
    # Setup our web3 object
    web3 = Web3(Web3.HTTPProvider(rpcUrl))
    privateKey = getPrivateKey()
    walletAddress = web3.eth.account.privateKeyToAccount(privateKey).address
    web3.eth.default_account = walletAddress

    initNonce = web3.eth.getTransactionCount(walletAddress, 'pending')

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
    signed_tx = web3.eth.account.sign_transaction(tx, private_key=privateKey)
    logger.debug("Transaction signed!")

    logger.info("Sending transaction...")
    try:
        web3.eth.send_raw_transaction(signed_tx.rawTransaction)
    except Exception as e:
        isKnownTransactionError = "known transaction" in e.args[0]["message"]
        isNonceTooLowError = "nonce too low" in e.args[0]["message"]
        if isKnownTransactionError:
            logger.warning("Hit isKnownTransactionError but going ahead...")
            pass
        elif isNonceTooLowError:
            logger.info(f"Nonce too low ({initNonce}) error caught...")
            actualNonce = web3.eth.getTransactionCount(walletAddress, 'pending')
            while actualNonce <= tx["nonce"]:
                actualNonce = web3.eth.getTransactionCount(walletAddress, 'pending')
            tx["nonce"] = actualNonce
            signed_tx = web3.eth.account.sign_transaction(tx, private_key=privateKey)
            logger.info("Nonce too low error solved - sending again...")
            web3.eth.send_raw_transaction(signed_tx.rawTransaction)
        else:
            raise Exception(e.args[0]["message"])
    logger.info("Transaction successfully sent!")

    explorerLink = generateBlockExplorerLink(explorerUrl, signed_tx.hash.hex())

    logger.info(f"{explorerLink}")

    logger.info(f"Waiting for transaction to be mined...")

    try:
        txReceipt = web3.eth.wait_for_transaction_receipt(transaction_hash=signed_tx.hash, poll_latency=2,
                                                          timeout=transactionTimeout)
    except exceptions.TimeExhausted:
        raise Exception("Wait for transaction receipt timed out!")
    except Exception as error:
        errorText = error.args[0]["message"]
        isBadResponseError = "The response was in an unexpected format and unable to be parsed" in errorText
        if isBadResponseError:
            retryLimit = 10
            retryCount = 0
            txReceipt = web3.eth.wait_for_transaction_receipt(transaction_hash=signed_tx.hash, poll_latency=2,
                                                              timeout=transactionTimeout)
            while "status" not in txReceipt:
                if retryCount <= retryLimit:
                    txReceipt = web3.eth.wait_for_transaction_receipt(transaction_hash=signed_tx.hash,
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
        currentRoundTrip=currentRoundTrip,
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
def topUpWalletGas(recipe, topUpDirection, topUpTokenToUse):
    from src.chain.swap.swap_Querys import getSwapQuoteIn
    from src.chain.swap.swap_Actions import swapToken

    minimumGasBalance = Decimal(recipe[topUpDirection]["chain"]["gasDetails"]["gasLimits"]["minGas"])
    maximumGasBalance = Decimal(recipe[topUpDirection]["chain"]["gasDetails"]["gasLimits"]["maxGas"])

    gasBalance = recipe[topUpDirection]["wallet"]["balances"]["gas"]

    needsGas = gasBalance < minimumGasBalance

    balanceBeforeBridge = getTokenBalance(
        rpcUrl=recipe[topUpDirection]["chain"]["rpc"],
        tokenAddress=recipe[topUpDirection][topUpTokenToUse]["address"],
        tokenDecimals=recipe[topUpDirection][topUpTokenToUse]["decimals"],
        wethContractABI=recipe[topUpDirection]["chain"]["contracts"]["weth"]["abi"]
    )

    if topUpDirection == "origin":
        gasTopUpCategory = f"gas_1"
    else:
        gasTopUpCategory = f"gas_2"

    if needsGas:

        gasTokensNeeded = maximumGasBalance - gasBalance

        routes = [recipe[topUpDirection][topUpTokenToUse]["address"], recipe[topUpDirection]["gas"]["address"]]

        amountInQuoted = getSwapQuoteIn(
            amountOutNormal=gasTokensNeeded,
            routes=routes
        )

        amountOutMinWithSlippage = getValueWithSlippage(amount=gasTokensNeeded, slippage=0.5)

        if amountInQuoted > balanceBeforeBridge:
            errMsg = f'Error topping up {topUpDirection} ({recipe[topUpDirection]["chain"]["name"]}) wallet with gas: ' \
                     f'Not enough {topUpTokenToUse}s (balance: {balanceBeforeBridge}) to purchase {gasTokensNeeded} {recipe[topUpDirection]["gas"]["symbol"]} ' \
                     f'for {amountInQuoted} {recipe[topUpDirection][topUpTokenToUse]["symbol"]}'
            logger.error(errMsg)
            raise Exception(errMsg)

        logger.info(
            f'{topUpDirection} wallet ({recipe[topUpDirection]["chain"]["name"]}) needs gas - adding {gasTokensNeeded} {recipe[topUpDirection]["gas"]["symbol"]} for {amountInQuoted} {recipe[topUpDirection][topUpTokenToUse]["symbol"]}')

        try:

            telegramStatusMessage = appendToMessage(messageToAppendTo=telegramStatusMessage,
                                                    messageToAppend=f"⛽️ Topping Up {topUpDirection.title()} Wallet -> 📤")

            result = swapToken(
                recipe=recipe,
                recipePosition=topUpDirection,
                tokenInAmount=amountInQuoted,
                tokenOutAmount=amountOutMinWithSlippage,
                tokenType=topUpTokenToUse,
                stepCategory=gasTopUpCategory
            )

            updateStatusMessage(originalMessage=result["telegramStatusMessage"], newStatus="✅")

        except Exception as err:
            errMsg = f'Error topping up {topUpDirection} ({recipe[topUpDirection]["chain"]["name"]}) wallet with gas: {err}'
            logger.error(errMsg)
            raise Exception(err)

        recipe[topUpDirection]["wallet"]["balances"]["gas"] = getWalletGasBalance(
            rpcUrl=recipe[topUpDirection]["chain"]["rpc"],
            walletAddress=recipe[topUpDirection]["wallet"]["address"],
            wethContractABI=recipe[topUpDirection]["chain"]["contracts"]["weth"]["abi"]
        )

        recipe = getWalletsInformation(
            recipe=recipe
        )

        logger.info(
            f'{topUpDirection} wallet ({recipe[topUpDirection]["chain"]["name"]}) topped up successful - new balance is {recipe[topUpDirection]["wallet"]["balances"]["gas"]} {recipe[topUpDirection]["gas"]["symbol"]}')

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
def approveToken(recipe, recipePosition, tokenType, spenderAddress, stepCategory):
    # Dict Params ####################################################
    rpcUrl = recipe[recipePosition]["chain"]["rpc"]
    walletAddress = recipe[recipePosition]["wallet"]["address"]
    tokenAddress = recipe[recipePosition][tokenType]["address"]
    wethAbi = recipe[recipePosition]["chain"]["contracts"]["weth"]["abi"]
    telegramStatusMessage = recipe["status"]["telegramMessage"]
    currentRoundTrip = recipe["status"]["currentRoundTrip"]
    explorerUrl = recipe[recipePosition]["chain"]["blockExplorer"]["txBaseURL"]
    # Dict Params ####################################################

    # Setup Web 3
    web3 = Web3(Web3.HTTPProvider(rpcUrl))
    web3.middleware_onion.inject(geth_poa_middleware, layer=0)

    # Get The Token Contract Which We Are Approving
    contract = web3.eth.contract(
        address=web3.toChecksumAddress(tokenAddress),
        abi=wethAbi
    )

    # Calculate The Amount We Will Approve
    amountToApprove = web3.toWei(2 ** 64 - 1, 'ether')

    # Build Out Transaction Object
    nonce = web3.eth.getTransactionCount(walletAddress, 'pending')
    tx = contract.functions.approve(spenderAddress, amountToApprove).buildTransaction({
        'from': walletAddress,
        'nonce': nonce,
        'gasPrice': web3.eth.gas_price,
    })

    # Sign And Send The Transaction
    transactionResult = signAndSendTransaction(
        tx=tx,
        rpcUrl=rpcUrl,
        explorerUrl=explorerUrl,
        currentRoundTrip=currentRoundTrip,
        stepCategory=stepCategory,
        telegramStatusMessage=telegramStatusMessage
    )

    # Update Our Stored Telegram Message
    recipe["status"]["telegramMessage"] = transactionResult["telegramMessage"]

    return recipe


def checkAndApproveToken(recipe, recipePosition, tokenType, approvalType, stepNumber):
    # Dict Params ####################################################
    telegramStatusMessage = recipe["status"]["telegramMessage"]
    # Dict Params ####################################################

    # Choose The Contract Address To Choose Based On If Its A Swap or Bridge Approval
    if approvalType == "swap":
        spenderAddress = recipe[recipePosition]["chain"]["contracts"]["router"]["address"]
    elif approvalType == "bridge":
        spenderAddress = recipe[recipePosition]["chain"]["contracts"]["bridges"]["synapse"]["address"]
    else:
        sys.exit(f"Invalid Approval Type: {approvalType}")

    # Check If The Token Is Approved
    isApproved = getTokenApprovalStatus(
        recipe=recipe,
        recipePosition=recipePosition,
        tokenType=tokenType,
        spenderAddress=spenderAddress
    )

    # If Token Is Not Approved - Approve It
    if not isApproved:
        # Log That We Approving
        printSeperator()
        logger.info(f'{stepNumber}.5 Approving {recipe[recipePosition][tokenType]["symbol"]}')
        recipe["status"]["telegramMessage"] = appendToMessage(
            messageToAppend=f"{stepNumber} Approving {recipe[recipePosition][tokenType]['symbol']} 💸",
            messageToAppendTo=telegramStatusMessage
        )
        printSeperator()

        # Approve The Token
        recipe = approveToken(
            recipe=recipe,
            recipePosition=recipePosition,
            tokenType=tokenType,
            spenderAddress=spenderAddress,
            stepCategory=f"{stepNumber}_5_{approvalType.lower()}"
        )

        printSeperator()

    return recipe
