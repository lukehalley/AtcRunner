
import os

from web3 import Web3

from src.apis.synapseBridge.synapseBridge_Generate import generateUnsignedBridgeTransaction
from src.chain.bridge.bridge_Querys import waitForBridgeToComplete
from src.chain.network.network_Actions import signAndSendTransaction
from src.chain.network.network_Querys import getWalletAddressFromPrivateKey, getTokenBalance
from src.utils.chain.chain_Wei import getTokenDecimalValue, getTokenNormalValue
from src.utils.logging.logging_Setup import getProjectLogger

logger = getProjectLogger()

def executeBridge(fromChain, fromTokenAddress, fromTokenDecimals, fromChainRPCURL, toChain, toTokenAddress, toTokenDecimals, toChainRPCURL, amountToBridge, explorerUrl, arbitrageNumber, stepCategory, telegramStatusMessage, stepNumber, wethContractABI, predictions=None):
    walletAddress = getWalletAddressFromPrivateKey(fromChainRPCURL)

    amountToBridgeWei = getTokenDecimalValue(amountToBridge, fromTokenDecimals)

    bridgeTransaction = \
        generateUnsignedBridgeTransaction(
            fromChain=fromChain,
            toChain=toChain,
            fromToken=fromTokenAddress,
            toToken=toTokenAddress,
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

    balanceBeforeBridge = getTokenBalance(rpcURL=toChainRPCURL, tokenAddress=toTokenAddress, tokenDecimals=toTokenDecimals, wethContractABI=wethContractABI)

    transactionResult = signAndSendTransaction(
        tx=tx,
        rpcURL=fromChainRPCURL,
        explorerUrl=explorerUrl,
        arbitrageNumber=arbitrageNumber,
        stepCategory=stepCategory,
        telegramStatusMessage=telegramStatusMessage)

    fundsBridged = waitForBridgeToComplete(
        transactionId=transactionResult["hash"],
        fromChain=fromChain,
        toChain=toChain,
        toChainRPCURL=toChainRPCURL,
        toTokenAddress=toTokenAddress,
        toTokenDecimals=toTokenDecimals,
        wethContractABI=wethContractABI,
        predictions=predictions,
        stepNumber=stepNumber
    )

    balanceAfterBridge = getTokenBalance(rpcURL=toChainRPCURL, tokenAddress=toTokenAddress, tokenDecimals=toTokenDecimals, wethContractABI=wethContractABI)

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