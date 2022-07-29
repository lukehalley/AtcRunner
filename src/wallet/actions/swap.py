import logging
import os
import sys
from decimal import Decimal

from web3 import Web3

from src.api.telegrambot import updatedStatusMessage
from src.utils.chain import getABI, getTransactionDeadline, getValueWithSlippage
from src.utils.general import printSettingUpWallet, strToBool, printSeperator, truncateDecimal
from src.utils.wei import getTokenNormalValue, getTokenDecimalValue
from src.wallet.actions.network import signAndSendTransaction
from src.wallet.queries.network import getTokenBalance, getWalletGasBalance, getWalletsInformation

# Set up our logging
from src.wallet.queries.swap import getSwapQuoteOut

logger = logging.getLogger("DFK-DEX")
transactionTimeout = int(os.environ.get("TRANSACTION_TIMEOUT_SECS"))

def setupWallet(recipe):
    originHasStablecoins = recipe["origin"]["wallet"]["balances"]["stablecoin"] > 0
    originHasTokens = recipe["origin"]["wallet"]["balances"]["token"] > 0

    if not originHasTokens and not originHasStablecoins:
        errMsg = f'Origin wallet has neither Tokens or Stablecoins!'
        logger.error(errMsg)
        sys.exit(errMsg)
    elif not originHasStablecoins:

        telegramStatusMessage = printSettingUpWallet(recipe['arbitrage']['currentRoundTripCount'])

        position = "origin"
        toSwapFrom = "token"
        toSwapTo = "stablecoin"

        maximumGasBalance = Decimal(os.environ.get("MAX_GAS_BALANCE"))
        amountInNormal = abs(recipe["origin"]["wallet"]["balances"][toSwapFrom] - maximumGasBalance)

        balanceBeforeSwap = recipe[position]["wallet"]["balances"][toSwapTo]

        swapRoute = recipe[position]["routes"][f"{toSwapFrom}-{toSwapTo}"]

        amountOutQuoted = getSwapQuoteOut(
            amountInNormal=amountInNormal,
            amountInDecimals=recipe[position][toSwapFrom]["decimals"],
            amountOutDecimals=recipe[position][toSwapTo]["decimals"],
            rpcUrl=recipe[position]["chain"]["rpc"],
            routerAddress=recipe[position]["chain"]["uniswapRouter"],
            routes=swapRoute
        )

        amountOutMinWithSlippage = getValueWithSlippage(amount=amountOutQuoted, slippage=0.5)

        swapResult = swapToken(
            amountInNormal=amountInNormal,
            amountInDecimals=recipe[position][toSwapFrom]["decimals"],
            amountOutNormal=amountOutMinWithSlippage,
            amountOutDecimals=recipe[position][toSwapTo]["decimals"],
            tokenPath=swapRoute,
            rpcURL=recipe[position]["chain"]["rpc"],
            arbitrageNumber=recipe["arbitrage"]["currentRoundTripCount"],
            stepCategory=f"0_setup",
            explorerUrl=recipe[position]["chain"]["blockExplorer"],
            routerAddress=recipe[position]["chain"]["uniswapRouter"],
            telegramStatusMessage=telegramStatusMessage,
            swappingFromGas=strToBool(recipe[position][toSwapFrom]["isGas"]),
            swappingToGas=strToBool(recipe[position][toSwapTo]["isGas"])
        )

        recipe = getWalletsInformation(recipe)

        balanceAfterSwap = recipe[position]["wallet"]["balances"][toSwapTo]

        while balanceAfterSwap == balanceBeforeSwap:
            recipe = getWalletsInformation(recipe)
            balanceAfterSwap = recipe[position]["wallet"]["balances"][toSwapTo]

        result = balanceAfterSwap - balanceBeforeSwap

        telegramStatusMessage = swapResult["telegramStatusMessage"]

        recipe = getWalletsInformation(recipe)

        printSeperator()

        logger.info(f'Output: {truncateDecimal(result, 6)} {recipe[position][toSwapTo]["name"]}')

        updatedStatusMessage(originalMessage=telegramStatusMessage, newStatus="✅")

        printSeperator(True)

def swapToken(amountInNormal, amountInDecimals, amountOutNormal, amountOutDecimals, tokenPath, rpcURL, routerAddress, arbitrageNumber, stepCategory, explorerUrl, telegramStatusMessage=None, swappingFromGas=False, swappingToGas=False):
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
    ABI = getABI("IUniswapV2Router02.json")
    contract = w3.eth.contract(routerAddress, abi=ABI)

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
        tx = contract.functions.swapExactTokensForETH(amountInWei, amountOutWei, normalisedRoutes, walletAddress, transactionDeadline).buildTransaction(txParams)
    elif swappingFromGas:
        tx = contract.functions.swapExactETHForTokens(amountOutWei, normalisedRoutes, walletAddress, transactionDeadline).buildTransaction(txParams)
        tx["value"] = amountInWei
    else:
        tx = contract.functions.swapExactTokensForTokens(amountInWei, amountOutWei, normalisedRoutes, walletAddress, transactionDeadline).buildTransaction(txParams)

    if swappingToGas:
        balanceBeforeSwap = getWalletGasBalance(rpcURL=rpcURL, walletAddress=walletAddress)
    else:
        balanceBeforeSwap = getTokenBalance(rpcURL=rpcURL, tokenAddress=tokenPath[-1], tokenDecimals=amountOutDecimals)

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
            balanceAfterSwap = getWalletGasBalance(rpcURL=rpcURL, walletAddress=walletAddress)
        else:
            balanceAfterSwap = getTokenBalance(rpcURL=rpcURL, tokenAddress=tokenPath[-1],
                                               tokenDecimals=amountOutDecimals)

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