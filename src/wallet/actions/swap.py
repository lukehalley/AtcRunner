import logging, sys
from web3 import Web3

from src.utils.chain import getABI, generateBlockExplorerLink, getTokenNormalValue, getTransactionDeadline, getTokenDecimalValue
from src.wallet.queries.network import getTokenBalance, getWalletGasBalance
from src.wallet.actions.network import signAndSendTransaction

# Set up our logging
logger = logging.getLogger("DFK-DEX")

def swapToken(amountInNormal, amountInDecimals, amountOutNormal, amountOutDecimals, tokenPath, rpcURL, routerAddress, arbitrageNumber, stepCategory, explorerUrl, telegramStatusMessage=None, txDeadline=300, txTimeoutSeconds=150, swappingToGas=False, gas=250000):
    from src.wallet.queries.network import getPrivateKey

    # Setup our web3 object
    w3 = Web3(Web3.HTTPProvider(rpcURL))
    privateKey = getPrivateKey()
    walletAddress = w3.eth.account.privateKeyToAccount(privateKey).address
    w3.eth.default_account = walletAddress

    # Get general settings for our transaction
    nonce = w3.eth.getTransactionCount(walletAddress)
    gasPriceWei = w3.fromWei(w3.eth.gas_price, 'gwei')

    # Get properties for our swap contract
    ABI = getABI("IUniswapV2Router02.json")
    contract = w3.eth.contract(routerAddress, abi=ABI)

    txParams = {
        'gasPrice': w3.toWei(gasPriceWei, 'gwei'),
        'nonce': nonce,
        'gas': gas
    }

    amountInWei = int(getTokenDecimalValue(amountInNormal, amountInDecimals))
    amountOutWei = int(getTokenDecimalValue(amountOutNormal, amountOutDecimals))

    transactionDeadline = getTransactionDeadline(timeInSeconds=txDeadline)

    normalisedRoutes = []

    for token in tokenPath:
        normalisedRoutes.append(Web3.toChecksumAddress(token))

    if swappingToGas:
        tx = contract.functions.swapExactTokensForETH(amountInWei, amountOutWei, normalisedRoutes, walletAddress, transactionDeadline).buildTransaction(txParams)
    else:
        tx = contract.functions.swapExactTokensForTokens(amountInWei, amountOutWei, normalisedRoutes, walletAddress, transactionDeadline).buildTransaction(txParams)

    if swappingToGas:
        balanceBeforeSwap = getWalletGasBalance(rpcURL=rpcURL, walletAddress=walletAddress)
    else:
        balanceBeforeSwap = getTokenBalance(rpcURL=rpcURL, tokenAddress=tokenPath[-1], tokenDecimals=amountOutDecimals)

    transactionResult = signAndSendTransaction(
        tx=tx,
        rpcURL=rpcURL,
        txTimeoutSeconds=txTimeoutSeconds,
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