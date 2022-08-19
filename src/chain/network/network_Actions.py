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
from src.utils.chain.chain_Wallet import getPrivateKey, getCurrentPositions, getCurrentStepCategoryAndNumber
from src.utils.logging.logging_Print import printSeperator

from src.utils.logging.logging_Setup import getProjectLogger
from src.utils.retry.retry_Params import getRetryParams, getTransactionTimeout
from src.utils.time.time_Calculations import getCurrentDateTime

logger = getProjectLogger()

transactionTimeout = getTransactionTimeout()
transactionRetryLimit, transactionRetryDelay,  = getRetryParams(retryType="transactionAction")

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def signAndSendTransaction(recipe, tx):

    # Build Params ############################################################
    currentPosition, currentOppositePosition = getCurrentPositions(recipe=recipe)
    currentStepNumber, currentStepCategory = getCurrentStepCategoryAndNumber(recipe=recipe)

    rpcURL = recipe[currentPosition]["chain"]["rpc"]
    explorerUrl = recipe[currentPosition]["chain"]["blockExplorer"]["txBaseURL"]
    roundTrip = recipe["status"]["currentRoundTrip"]
    telegramStatusMessage = recipe["status"]["telegramMessage"]
    # Build Params ############################################################

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
        roundTrip=roundTrip,
        stepCategory=currentStepCategory
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
def topUpWalletGas(recipe, toSwapFrom):
    from src.chain.swap.swap_Querys import getSwapQuoteIn
    from src.chain.swap.swap_Actions import swapToken

    # Build Params ############################################################
    currentPosition, currentOppositePosition = getCurrentPositions(recipe=recipe)
    # Build Params ############################################################

    minimumGasBalance = Decimal(recipe[currentPosition]["chain"]["gasDetails"]["gasLimits"]["minGas"])
    maximumGasBalance = Decimal(recipe[currentPosition]["chain"]["gasDetails"]["gasLimits"]["maxGas"])

    gasBalance = recipe[currentPosition]["wallet"]["balances"]["gas"]

    needsGas = gasBalance < minimumGasBalance

    balanceBeforeBridge = getTokenBalance(
        rpcURL=recipe[currentPosition]["chain"]["rpc"],
        tokenAddress=recipe[currentPosition][toSwapFrom]["address"],
        tokenDecimals=recipe[currentPosition][toSwapFrom]["decimals"],
        wethContractABI=recipe[currentPosition]["chain"]["contracts"]["weth"]["abi"]
    )

    if currentPosition == "origin":
        gasTopUpCategory = f"gas_1"
    else:
        gasTopUpCategory = f"gas_2"

    if needsGas:

        gasTokensNeeded = maximumGasBalance - gasBalance

        routes = [recipe[currentPosition][toSwapFrom]["address"], recipe[currentPosition]["gas"]["address"]]

        amountInQuoted = getSwapQuoteIn(
            recipe=recipe,
            recipecurrentPosition=currentPosition,
            recipeToken=toSwapFrom,
            recipeTokenIsGas=recipe[currentPosition][toSwapFrom]["isGas"],
            amountOutNormal=gasTokensNeeded
        )

        amountOutMinWithSlippage = getValueWithSlippage(amount=gasTokensNeeded, slippage=0.5)

        if amountInQuoted > balanceBeforeBridge:
            errMsg = f'Error topping up {currentPosition} ({recipe[currentPosition]["chain"]["name"]}) wallet with gas: ' \
                     f'Not enough {toSwapFrom}s (balance: {balanceBeforeBridge}) to purchase {gasTokensNeeded} {recipe[currentPosition]["gas"]["symbol"]} ' \
                     f'for {amountInQuoted} {recipe[currentPosition][toSwapFrom]["symbol"]}'
            logger.error(errMsg)
            raise Exception(errMsg)

        logger.info(f'{currentPosition} wallet ({recipe[currentPosition]["chain"]["name"]}) needs gas - adding {gasTokensNeeded} {recipe[currentPosition]["gas"]["symbol"]} for {amountInQuoted} {recipe[currentPosition][toSwapFrom]["symbol"]}')

        try:

            recipe = appendToMessage(recipe=recipe,
                                                    messageToAppend=f"⛽️ Topping Up {currentPosition.title()} Wallet -> 📤")

            result = swapToken(
                amountInNormal=amountInQuoted,
                amountInDecimals=recipe[currentPosition][toSwapFrom]["decimals"],
                amountOutNormal=amountOutMinWithSlippage,
                amountOutDecimals=18,
                tokenPath=routes,
                rpcURL=recipe[currentPosition]["chain"]["rpc"],
                roundTrip=recipe["status"]["currentRoundTrip"],
                stepCategory=gasTopUpCategory,
                explorerUrl=recipe[currentPosition]["chain"]["blockExplorer"]["txBaseURL"],
                routerAddress=recipe[currentPosition]["chain"]["contracts"]["router"]["address"],
                routerABI=recipe[currentPosition]["chain"]["contracts"]["router"]["abi"],
                routerABIMappings=recipe[currentPosition]["chain"]["contracts"]["router"]["mapping"],
                wethContractABI=recipe[currentPosition]["chain"]["contracts"]["weth"]["abi"],
                swappingFromGas=False,
                swappingToGas=True
            )

            updateStatusMessage(originalMessage=result["telegramStatusMessage"], newStatus="✅")

        except Exception as err:
            errMsg = f'Error topping up {currentPosition} ({recipe[currentPosition]["chain"]["name"]}) wallet with gas: {err}'
            logger.error(errMsg)
            raise Exception(err)

        recipe[currentPosition]["wallet"]["balances"]["gas"] = getWalletGasBalance(
            rpcURL=recipe[currentPosition]["chain"]["rpc"],
            walletAddress=recipe[currentPosition]["wallet"]["address"],
            wethContractABI=recipe[currentPosition]["chain"]["contracts"]["weth"]["abi"]
        )

        recipe = getWalletsInformation(recipe)

        logger.info(f'{currentPosition} wallet ({recipe[currentPosition]["chain"]["name"]}) topped up successful - new balance is {recipe[currentPosition]["wallet"]["balances"]["gas"]} {recipe[currentPosition]["gas"]["symbol"]}')

    return recipe, needsGas

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
def approveToken(recipe, tokenAddress, spenderAddress):

    # Build Params ############################################################
    currentPosition, currentOppositePosition = getCurrentPositions(recipe=recipe)
    currentStepNumber, currentStepCategory = getCurrentStepCategoryAndNumber(recipe=recipe)

    rpcUrl = recipe[currentPosition]["chain"]["rpc"]
    explorerUrl = recipe[currentPosition]["chain"]["blockExplorer"]["txBaseURL"]
    walletAddress = recipe[currentPosition]["wallet"]["address"]
    wethAbi = recipe[currentPosition]["chain"]["contracts"]["weth"]["abi"]
    roundTrip = recipe["status"]["currentRoundTrip"]
    stepCategory = f"{currentStepNumber}_5_{currentStepCategory.lower()}"

    # Build Params ############################################################

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

    signAndSendTransaction(
        recipe=recipe,
        tx=tx
    )

    return recipe

def checkAndApproveToken(recipe, toSwapFrom, isSwap):

    # Build Params ############################################################
    currentPosition, currentOppositePosition = getCurrentPositions(recipe=recipe)
    currentStepNumber, currentStepCategory = getCurrentStepCategoryAndNumber(recipe=recipe)
    # Build Params ############################################################

    if isSwap:
        typeText = "Swap"
        spenderAddress = recipe[currentPosition]["chain"]["contracts"]["router"]["address"]
    else:
        typeText = "Bridge"
        spenderAddress = recipe[currentPosition]["chain"]["contracts"]["bridges"]["synapse"]["address"]

    isApproved = getTokenApprovalStatus(
        rpcUrl=recipe[currentPosition]["chain"]["rpc"],
        walletAddress=recipe[currentPosition]["wallet"]["address"],
        tokenAddress=recipe[currentPosition][toSwapFrom]["address"],
        spenderAddress=spenderAddress,
        wethAbi=recipe[currentPosition]["chain"]["contracts"]["weth"]["abi"]
    )

    if not isApproved:
        printSeperator()

        logger.info(f'{currentStepNumber}.5 Approving {recipe[currentPosition][toSwapFrom]["symbol"]} {typeText}')
        recipe = appendToMessage(recipe=recipe,
                                                messageToAppend=f"{currentStepNumber} Approving {recipe[currentPosition][toSwapFrom]['symbol']} {typeText} 💸")

        printSeperator()

        recipe = approveToken(
            recipe=recipe,
            tokenAddress=recipe[currentPosition][toSwapFrom]["address"],
            spenderAddress=spenderAddress
        )

        printSeperator()

    return recipe
