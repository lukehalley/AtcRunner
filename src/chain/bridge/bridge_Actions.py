import os

from web3 import Web3

from src.apis.synapseBridge.synapseBridge_Generate import generateUnsignedBridgeTransaction
from src.arbitrage.arbitrage_Utils import getOppositeToken
from src.chain.bridge.bridge_Querys import waitForBridgeToComplete
from src.chain.network.network_Actions import signAndSendTransaction
from src.chain.network.network_Querys import getWalletAddressFromPrivateKey, getTokenBalance
from src.utils.chain.chain_Wallet import getCurrentPositions
from src.utils.chain.chain_Wei import getTokenDecimalValue, getTokenNormalValue
from src.utils.logging.logging_Setup import getProjectLogger

logger = getProjectLogger()

def executeBridge(recipe, tokenToBridge):

    currentPosition, currentOppositePosition = getCurrentPositions(recipe=recipe)
    oppositeToken = getOppositeToken(token=tokenToBridge)

    walletAddress = getWalletAddressFromPrivateKey(
        rpcURL=recipe[currentPosition]["chain"]["rpc"]
    )

    amountToBridgeWei = getTokenDecimalValue(
        amount=recipe[currentPosition]["chain"]["wallet"]["balances"][tokenToBridge],
        decimalPlaces=recipe[currentPosition][tokenToBridge]["decimals"]
    )

    bridgeTransaction = \
        generateUnsignedBridgeTransaction(
            fromChain=recipe[currentPosition]["chain"]["id"],
            toChain=recipe[currentOppositePosition]["chain"]["id"],
            fromToken=recipe[currentPosition][tokenToBridge]["address"],
            toToken=recipe[currentPosition][oppositeToken]["address"],
            amountFrom=amountToBridgeWei,
            addressTo=walletAddress
        )

    if "value" not in bridgeTransaction:
        bridgeTransaction["value"] = "0"

    w3 = Web3(Web3.HTTPProvider(endpoint_uri=recipe[currentPosition]["chain"]["rpc"]))
    gasPriceWei = w3.fromWei(w3.eth.gas_price, 'gwei')

    tx = {
        'nonce': w3.eth.getTransactionCount(walletAddress, 'pending'),
        'to': bridgeTransaction["to"],
        'chainId': int(recipe[currentPosition]["chain"]["id"]),
        'gas': int(os.environ.get("BRIDGE_GAS")),
        'gasPrice': w3.eth.gas_price,
        'data': bridgeTransaction["unsigned_data"],
        'value': int(bridgeTransaction["value"])
    }

    balanceBeforeBridge = getTokenBalance(
        rpcURL=recipe[currentOppositePosition]["chain"]["rpc"],
        tokenAddress=recipe[currentPosition][oppositeToken]["address"],
        tokenDecimals=recipe[currentPosition][oppositeToken]["decimals"],
        wethContractABI=recipe[currentOppositePosition]["chain"]["contracts"]["weth"]["abi"]
    )

    transactionResult = signAndSendTransaction(
        recipe=recipe,
        tx=tx
    )

    fundsBridged = waitForBridgeToComplete(
        recipe=recipe,
        transactionId=transactionResult["hash"]
    )

    balanceAfterBridge = getTokenBalance(
        rpcURL=recipe[currentOppositePosition]["chain"]["rpc"],
        tokenAddress=recipe[currentOppositePosition][oppositeToken]["address"],
        tokenDecimals=recipe[currentOppositePosition][oppositeToken]["decimals"],
        wethContractABI=recipe[currentOppositePosition]["chain"]["contracts"]["weth"]["abi"]
    )

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