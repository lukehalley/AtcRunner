import logging, os
from web3 import Web3

from src.utils.wei import getTokenNormalValue, getTokenDecimalValue

from src.api.synapsebridge import generateUnsignedBridgeTransaction

from src.wallet.queries.network import getWalletAddressFromPrivateKey, getTokenBalance
from src.wallet.queries.bridge import waitForBridgeToComplete
from src.wallet.actions.network import signAndSendTransaction

# Set up our logging
logger = logging.getLogger("DFK-DEX")

def executeBridge(fromChain, fromTokenSymbol, fromTokenDecimals, fromChainRPCURL, toChain, toTokenAddress, toTokenSymbol, toTokenDecimals, toChainRPCURL, amountToBridge, explorerUrl, arbitrageNumber, stepCategory, telegramStatusMessage, predictions, stepNumber, txTimeoutSeconds=150):
    walletAddress = getWalletAddressFromPrivateKey(fromChainRPCURL)

    amountToBridgeWei = getTokenDecimalValue(amountToBridge, fromTokenDecimals)

    bridgeTransaction = \
        generateUnsignedBridgeTransaction(
            fromChain=fromChain,
            toChain=toChain,
            fromToken=fromTokenSymbol,
            toToken=toTokenSymbol,
            amountFrom=amountToBridgeWei,
            addressTo=walletAddress
        )

    if "value" not in bridgeTransaction:
        bridgeTransaction["value"] = "0"

    w3 = Web3(Web3.HTTPProvider(fromChainRPCURL))
    gasPriceWei = w3.fromWei(w3.eth.gas_price, 'gwei')

    tx = {
        'nonce': w3.eth.getTransactionCount(walletAddress, 'pending'),
        'to': bridgeTransaction["to"],
        'chainId': int(fromChain),
        'gas': int(os.environ.get("BRIDGE_GAS")),
        'gasPrice': w3.eth.gas_price,
        'data': bridgeTransaction["unsigned_data"],
        'value': int(bridgeTransaction["value"])
    }

    balanceBeforeBridge = getTokenBalance(rpcURL=toChainRPCURL, tokenAddress=toTokenAddress, tokenDecimals=toTokenDecimals)

    transactionResult = signAndSendTransaction(
        tx=tx,
        rpcURL=fromChainRPCURL,
        txTimeoutSeconds=txTimeoutSeconds,
        explorerUrl=explorerUrl,
        arbitrageNumber=arbitrageNumber,
        stepCategory=stepCategory,
        telegramStatusMessage=telegramStatusMessage)

    fundsBridged = waitForBridgeToComplete(
        transactionId=transactionResult["hash"],
        toToken=toTokenSymbol,
        fromChain=fromChain,
        toChain=toChain,
        toChainRPCURL=toChainRPCURL,
        toTokenAddress=toTokenAddress,
        toTokenDecimals=toTokenDecimals,
        predictions=predictions,
        stepNumber=stepNumber
    )

    balanceAfterBridge = getTokenBalance(rpcURL=toChainRPCURL, tokenAddress=toTokenAddress, tokenDecimals=toTokenDecimals)

    actualBridgedAmount = balanceAfterBridge - balanceBeforeBridge

    result = {
        "successfull": fundsBridged,
        "bridgeOutput": actualBridgedAmount,
        "fee": getTokenNormalValue(transactionResult["gasUsed"] * w3.toWei(gasPriceWei, 'gwei'), 18),
        "blockURL": transactionResult["explorerLink"],
        "hash": transactionResult["hash"],
        "telegramStatusMessage": transactionResult["telegramStatusMessage"]
    }

    return result