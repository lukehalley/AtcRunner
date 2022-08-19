import os
from decimal import Decimal

from web3 import Web3

from src.apis.telegramBot.telegramBot_Action import updateStatusMessage
from src.chain.network.network_Actions import buildMappedContractFunction, signAndSendTransaction
from src.chain.network.network_Querys import getWalletsInformation, getWalletGasBalance, getTokenBalance
from src.chain.swap.swap_Querys import getSwapQuoteOut
from src.utils.chain.chain_ABI import getMappedContractFunction
from src.utils.chain.chain_Calculations import getValueWithSlippage, getTransactionDeadline
from src.utils.chain.chain_Wallet import getPrivateKey
from src.utils.chain.chain_Wei import getTokenDecimalValue, getTokenNormalValue
from src.utils.logging.logging_Print import printSettingUpWallet, printSeperator
from src.utils.logging.logging_Setup import getProjectLogger
from src.utils.math.math_Decimal import truncateDecimal

logger = getProjectLogger()

transactionTimeout = getTransactionDeadline()

def setupWallet(recipe):
    originHasStablecoins = recipe["origin"]["wallet"]["balances"]["stablecoin"] > 0.1
    originHasTokens = recipe["origin"]["wallet"]["balances"]["token"] > 0

    if not originHasTokens and not originHasStablecoins:
        errMsg = f'Origin wallet has neither Tokens or Stablecoins!'
        logger.error(errMsg)
        raise Exception(errMsg)
    elif not originHasStablecoins:

        telegramStatusMessage = printSettingUpWallet(recipe['status']['currentRoundTrip'])

        positionToSetup = "origin"
        toSwapFrom = "token"
        toSwapTo = "stablecoin"

        if recipe[positionToSetup][toSwapFrom]["isGas"]:
            maximumGasBalance = Decimal(os.environ.get("MAX_GAS_BALANCE"))
            amountInNormal = abs(recipe[positionToSetup]["wallet"]["balances"][toSwapFrom] - maximumGasBalance)
        else:
            amountInNormal = recipe[positionToSetup]["wallet"]["balances"][toSwapFrom]

        balanceBeforeSwap = recipe[positionToSetup]["wallet"]["balances"][toSwapTo]

        amountOutQuoted = getSwapQuoteOut(
            recipe=recipe,
            recipeDirection=positionToSetup,
            recipeToken=toSwapFrom,
            recipeTokenIsGas=recipe[positionToSetup][toSwapFrom]["isGas"],
            amountInNormal=amountInNormal
        )

        amountOutMinWithSlippage = getValueWithSlippage(amount=amountOutQuoted, slippage=0.5)

        swapResult = swapToken(
            amountInNormal=amountInNormal,
            amountInDecimals=recipe[positionToSetup][toSwapFrom]["decimals"],
            amountOutNormal=amountOutMinWithSlippage,
            amountOutDecimals=recipe[positionToSetup][toSwapTo]["decimals"],
            tokenPath=swapRoute,
            rpcURL=recipe[positionToSetup]["chain"]["rpc"],
            roundTrip=recipe["status"]["currentRoundTrip"],
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
              roundTrip, stepCategory, explorerUrl, wethContractABI, telegramStatusMessage=None,
              swappingFromGas=False, swappingToGas=False):

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
        roundTrip=roundTrip,
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
