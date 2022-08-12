import logging
import os
import sys
from decimal import Decimal

from web3 import Web3

from src.api.telegrambot import updateStatusMessage, appendToMessage
from src.utils.chain import getABI, getTransactionDeadline, getValueWithSlippage
from src.utils.general import printSettingUpWallet, strToBool, printSeperator, truncateDecimal
from src.utils.wei import getTokenNormalValue, getTokenDecimalValue
from src.wallet.actions.network import signAndSendTransaction, callMappedContractFunction, buildMappedContractFunction, approveToken
from src.wallet.queries.network import getTokenBalance, getWalletGasBalance, getWalletsInformation, \
    getMappedContractFunction, getTokenApprovalStatus

# Set up our logging
from src.wallet.queries.swap import getSwapQuoteOut

logger = logging.getLogger("DFK-DEX")
transactionTimeout = int(os.environ.get("TRANSACTION_TIMEOUT_SECS"))


def setupWallet(recipe):
    originHasStablecoins = recipe["origin"]["wallet"]["balances"]["stablecoin"] > 0.1
    originHasTokens = recipe["origin"]["wallet"]["balances"]["token"] > 0

    if not originHasTokens and not originHasStablecoins:
        errMsg = f'Origin wallet has neither Tokens or Stablecoins!'
        logger.error(errMsg)
        raise Exception(errMsg)
    elif not originHasStablecoins:

        telegramStatusMessage = printSettingUpWallet(recipe['arbitrage']['currentRoundTripCount'])

        positionToSetup = "origin"
        toSwapFrom = "token"
        toSwapTo = "stablecoin"

        if recipe[positionToSetup][toSwapFrom]["isGas"]:
            maximumGasBalance = Decimal(os.environ.get("MAX_GAS_BALANCE"))
            amountInNormal = abs(recipe[positionToSetup]["wallet"]["balances"][toSwapFrom] - maximumGasBalance)
        else:
            amountInNormal = recipe[positionToSetup]["wallet"]["balances"][toSwapFrom]

        balanceBeforeSwap = recipe[positionToSetup]["wallet"]["balances"][toSwapTo]

        swapRoute = recipe[positionToSetup]["routes"][f"{toSwapFrom}-{toSwapTo}"]

        amountOutQuoted = getSwapQuoteOut(
            amountInNormal=amountInNormal,
            amountInDecimals=recipe[positionToSetup][toSwapFrom]["decimals"],
            amountOutDecimals=recipe[positionToSetup][toSwapTo]["decimals"],
            rpcUrl=recipe[positionToSetup]["chain"]["rpc"],
            routerAddress=recipe[positionToSetup]["chain"]["contracts"]["router"]["address"],
            routerABI=recipe[positionToSetup]["chain"]["contracts"]["router"]["abi"],
            routerABIMappings=recipe[positionToSetup]["chain"]["contracts"]["router"]["mapping"],
            routes=swapRoute
        )

        amountOutMinWithSlippage = getValueWithSlippage(amount=amountOutQuoted, slippage=0.5)

        swapApproved = getTokenApprovalStatus(
            rpcUrl=recipe[positionToSetup]["chain"]["rpc"],
            walletAddress=recipe[positionToSetup]["wallet"]["address"],
            tokenAddress=recipe[positionToSetup][toSwapFrom]["address"],
            spenderAddress=recipe[positionToSetup]["chain"]["contracts"]["router"]["address"],
            wethAbi=recipe[positionToSetup]["chain"]["contracts"]["weth"]["abi"]
        )

        if not swapApproved:
            printSeperator()

            logger.info(f'Approving {recipe[positionToSetup][toSwapFrom]["symbol"]} Swap')

            printSeperator()

            telegramStatusMessage = appendToMessage(originalMessage=telegramStatusMessage,
                                                    messageToAppend=f"Approving {recipe[positionToSetup][toSwapFrom]['symbol']} Swap 💸")

            telegramStatusMessage = approveToken(
                rpcUrl=recipe[positionToSetup]["chain"]["rpc"],
                explorerUrl=recipe[positionToSetup]["chain"]["blockExplorer"]["txBaseURL"],
                walletAddress=recipe[positionToSetup]["wallet"]["address"],
                tokenAddress=recipe[positionToSetup][toSwapFrom]["address"],
                spenderAddress=recipe[positionToSetup]["chain"]["contracts"]["router"]["address"],
                wethAbi=recipe[positionToSetup]["chain"]["contracts"]["weth"]["abi"],
                arbitrageNumber=recipe["arbitrage"]["currentRoundTripCount"],
                stepCategory=f"0_5_swap",
                telegramStatusMessage=telegramStatusMessage
            )

            printSeperator()

        swapResult = swapToken(
            amountInNormal=amountInNormal,
            amountInDecimals=recipe[positionToSetup][toSwapFrom]["decimals"],
            amountOutNormal=amountOutMinWithSlippage,
            amountOutDecimals=recipe[positionToSetup][toSwapTo]["decimals"],
            tokenPath=swapRoute,
            rpcURL=recipe[positionToSetup]["chain"]["rpc"],
            arbitrageNumber=recipe["arbitrage"]["currentRoundTripCount"],
            stepCategory=f"0_setup",
            explorerUrl=recipe[positionToSetup]["chain"]["blockExplorer"]["txBaseURL"],
            routerAddress=recipe[positionToSetup]["chain"]["contracts"]["router"]["address"],
            routerABI=recipe[positionToSetup]["chain"]["contracts"]["router"]["abi"],
            routerABIMappings=recipe[positionToSetup]["chain"]["contracts"]["router"]["mapping"],
            wethContractABI=recipe[positionToSetup]["chain"]["contracts"]["weth"]["abi"],
            telegramStatusMessage=telegramStatusMessage,
            swappingFromGas=recipe[positionToSetup][toSwapFrom]["isGas"],
            swappingToGas=recipe[positionToSetup][toSwapTo]["isGas"]
        )

        recipe = getWalletsInformation(recipe)

        balanceAfterSwap = recipe[positionToSetup]["wallet"]["balances"][toSwapTo]

        while balanceAfterSwap == balanceBeforeSwap:
            recipe = getWalletsInformation(recipe)
            balanceAfterSwap = recipe[positionToSetup]["wallet"]["balances"][toSwapTo]

        result = balanceAfterSwap - balanceBeforeSwap

        telegramStatusMessage = swapResult["telegramStatusMessage"]

        recipe = getWalletsInformation(recipe)

        printSeperator()

        logger.info(f'Output: {truncateDecimal(result, 6)} {recipe[positionToSetup][toSwapTo]["name"]}')

        updateStatusMessage(originalMessage=telegramStatusMessage, newStatus="✅")

        printSeperator(True)


def swapToken(amountInNormal, amountInDecimals, amountOutNormal, amountOutDecimals, tokenPath, rpcURL, routerAddress, routerABI, routerABIMappings,
              arbitrageNumber, stepCategory, explorerUrl, wethContractABI, telegramStatusMessage=None,
              swappingFromGas=False, swappingToGas=False):
    from src.wallet.queries.network import getPrivateKey

    # Setup our web3 object
    w3 = Web3(Web3.HTTPProvider(rpcURL))
    privateKey = getPrivateKey()
    walletAddress = w3.eth.account.privateKeyToAccount(privateKey).address
    w3.eth.default_account = walletAddress

    # Get general settings for our transaction
    nonce = w3.eth.getTransactionCount(walletAddress, 'pending')
    gasPriceWei = w3.fromWei(w3.eth.gas_price, 'gwei')

    # Get properties for our swap contract
    contract = w3.eth.contract(routerAddress, abi=routerABI)

    txParams = {
        'gasPrice': w3.toWei(gasPriceWei, 'gwei'),
        'nonce': nonce,
        'gas': int(os.environ.get("SWAP_GAS"))
    }

    amountInWei = int(getTokenDecimalValue(amountInNormal, amountInDecimals))
    amountOutWei = int(getTokenDecimalValue(amountOutNormal, amountOutDecimals))

    normalisedRoutes = []

    for token in tokenPath:
        normalisedRoutes.append(Web3.toChecksumAddress(token))

    transactionDeadline = getTransactionDeadline(timeInSeconds=transactionTimeout)

    if swappingToGas:

        params = [
            amountInWei,
            amountOutWei,
            normalisedRoutes,
            walletAddress,
            transactionDeadline
        ]

        swapExactTokensForETHFunctionName = getMappedContractFunction(functionName="swapExactTokensForETH", abiMapping=routerABIMappings)

        tx = buildMappedContractFunction(contract=contract, functionToCall=swapExactTokensForETHFunctionName, txParams=txParams, functionParams=params)

    elif swappingFromGas:

        params = [
            amountOutWei,
            normalisedRoutes,
            walletAddress,
            transactionDeadline
        ]

        swapExactETHForTokensFunctionName = getMappedContractFunction(functionName="swapExactETHForTokens", abiMapping=routerABIMappings)

        tx = buildMappedContractFunction(contract=contract, functionToCall=swapExactETHForTokensFunctionName, txParams=txParams, functionParams=params)

        tx["value"] = amountInWei

    else:

        params = [
            amountInWei,
            amountOutWei,
            normalisedRoutes,
            walletAddress,
            transactionDeadline
        ]

        swapExactTokensForTokensFunctionName = getMappedContractFunction(functionName="swapExactTokensForTokens", abiMapping=routerABIMappings)

        tx = buildMappedContractFunction(contract=contract, functionToCall=swapExactTokensForTokensFunctionName, txParams=txParams, functionParams=params)

    if swappingToGas:
        balanceBeforeSwap = getWalletGasBalance(rpcURL=rpcURL, walletAddress=walletAddress,
                                                wethContractABI=wethContractABI)
    else:
        balanceBeforeSwap = getTokenBalance(rpcURL=rpcURL, tokenAddress=tokenPath[-1], tokenDecimals=amountOutDecimals, wethContractABI=wethContractABI)

    transactionResult = signAndSendTransaction(
        tx=tx,
        rpcURL=rpcURL,
        explorerUrl=explorerUrl,
        arbitrageNumber=arbitrageNumber,
        stepCategory=stepCategory,
        telegramStatusMessage=telegramStatusMessage
    )

    balanceAfterSwap = balanceBeforeSwap

    while balanceAfterSwap <= balanceBeforeSwap:
        if swappingToGas:
            balanceAfterSwap = getWalletGasBalance(rpcURL=rpcURL, walletAddress=walletAddress, wethContractABI=wethContractABI)
        else:
            balanceAfterSwap = getTokenBalance(rpcURL=rpcURL, tokenAddress=tokenPath[-1],
                                               tokenDecimals=amountOutDecimals, wethContractABI=wethContractABI)

    actualSwapAmount = balanceAfterSwap - balanceBeforeSwap

    result = {
        "successfull": transactionResult["wasSuccessful"],
        "swapOutput": actualSwapAmount,
        "fee": getTokenNormalValue(transactionResult["gasUsed"] * w3.toWei(gasPriceWei, 'gwei'), 18),
        "blockURL": transactionResult['explorerLink'],
        "hash": transactionResult["hash"],
        "telegramStatusMessage": transactionResult["telegramStatusMessage"]
    }

    return result
