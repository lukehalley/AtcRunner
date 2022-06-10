import logging
from web3 import Web3

from src.wallet.queries.network import getWalletAddressFromPrivateKey, getPrivateKey
from src.utils.chain import getTokenDecimalValue
from src.api.synapsebridge import generateUnsignedBridgeTransaction
from src.wallet.queries.bridge import waitForBridgeToComplete

# Set up our logging
logger = logging.getLogger("DFK-DEX")

def executeBridge(amountToBridge, decimals, fromChain, toChain, fromToken, toToken, rpcURL):
    walletAddress = getWalletAddressFromPrivateKey(rpcURL)

    amountToBridgeWei = getTokenDecimalValue(amountToBridge, decimals)

    bridgeTransaction = \
        generateUnsignedBridgeTransaction(
            fromChain=fromChain,
            toChain=toChain,
            fromToken=fromToken,
            toToken=toToken,
            amountFrom=amountToBridgeWei,
            addressTo=walletAddress
        )

    w3 = Web3(Web3.HTTPProvider(rpcURL))

    transaction = {
        'nonce': w3.eth.getTransactionCount(walletAddress),
        "chainId": bridgeTransaction["chainId"],
        'to': bridgeTransaction["to"],
        'gas': 100206,
        'gasPrice': w3.eth.gas_price,
        'data': bridgeTransaction["unsigned_data"],
        'value': int(bridgeTransaction["value"])
    }

    privateKey = getPrivateKey()

    signedTransaction = w3.eth.account.sign_transaction(transaction, privateKey)

    sentTransaction = w3.eth.send_raw_transaction(signedTransaction.rawTransaction)

    transactionDetails = w3.eth.waitForTransactionReceipt(sentTransaction)

    transactionID = transactionDetails["transactionHash"].hex()

    logger.info(f"Sent bridge transaction: {transactionID}")

    fundsBridged = waitForBridgeToComplete(
        transactionId=transactionID,
        amountSent=amountToBridge,
        toToken=toToken,
        toChain=toChain,
        timeout=600
    )

    return fundsBridged