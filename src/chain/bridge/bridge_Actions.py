import os

from web3 import Web3

from src.apis.synapseBridge.synapseBridge_Generate import generateUnsignedBridgeTransaction
from src.arbitrage.arbitrage_Utils import getOppositeToken
from src.chain.bridge.bridge_Querys import waitForBridgeToComplete
from src.chain.network.network_Actions import signAndSendTransaction
from src.chain.network.network_Querys import getWalletAddressFromPrivateKey, getTokenBalance
from src.utils.chain.chain_Wei import getTokenDecimalValue, getTokenNormalValue
from src.utils.logging.logging_Setup import getProjectLogger

logger = getProjectLogger()


def executeBridge(recipe, recipePosition, tokenAmountBridge, tokenType, stepCategory, stepNumber, predictions=None):

    # Dict Params ####################################################
    # Token Params
    tokenTypeOpposite = getOppositeToken(tokenType)
    tokenInAddress = recipe[recipePosition][tokenType]["address"]
    tokenInDecimals = recipe[recipePosition][tokenType]["decimals"]
    tokenOutAddress = recipe[tokenTypeOpposite][tokenType]["address"]
    # Chains Params
    fromChainId = recipe[recipePosition]["chain"]["id"]
    fromChainRPC = recipe[recipePosition]["chain"]["rpc"]
    toChainId = recipe[tokenTypeOpposite]["chain"]["id"]
    fromChainRPC = recipe[recipePosition]["chain"]["rpc"]
    # Static Params

    wethContractABI = recipe[recipePosition]["chain"]["contracts"]["weth"]["abi"]
    explorerUrl = recipe[recipePosition]["chain"]["blockExplorer"]["txBaseURL"]
    # Dict Params ####################################################

    # Get Wallet Address From Private Key
    walletAddress = getWalletAddressFromPrivateKey(
        rpcUrl=fromChainRPC
    )

    # Get The Amount We Want To Bridge In Wei
    amountToBridgeWei = getTokenDecimalValue(
        amount=tokenAmountBridge,
        decimalPlaces=tokenInDecimals
    )

    # Generate An Unsigned Bridge Transaction
    bridgeTransaction = \
        generateUnsignedBridgeTransaction(
            fromChainId=fromChainId,
            toChainId=toChainId,
            fromToken=tokenInAddress,
            toToken=tokenOutAddress,
            amountFrom=amountToBridgeWei,
            addressTo=walletAddress
        )

    if "value" not in bridgeTransaction:
        bridgeTransaction["value"] = "0"

    web3 = Web3(Web3.HTTPProvider(fromChainRPC))
    gasPriceWei = web3.fromWei(web3.eth.gas_price, 'gwei')

    tx = {
        'nonce': web3.eth.getTransactionCount(walletAddress, 'pending'),
        'to': bridgeTransaction["to"],
        'chainId': int(fromChainId),
        'gas': int(os.environ.get("BRIDGE_GAS")),
        'gasPrice': web3.eth.gas_price,
        'data': bridgeTransaction["unsigned_data"],
        'value': int(bridgeTransaction["value"])
    }

    balanceBeforeBridge = getTokenBalance(fromChainRPC=toChainRPCURL, tokenAddress=tokenOutAddress,
                                          tokenDecimals=tokenInDecimals, wethContractABI=wethContractABI)

    transactionResult = signAndSendTransaction(
        tx=tx,
        fromChainRPC=fromChainRPC,
        explorerUrl=explorerUrl,
        currentRoundTrip=currentRoundTrip,
        stepCategory=stepCategory,
        telegramStatusMessage=telegramStatusMessage)

    fundsBridged = waitForBridgeToComplete(
        transactionId=transactionResult["hash"],
        fromChainId=fromChainId,
        toChainId=toChainId,
        toChainRPCURL=toChainRPCURL,
        tokenOutAddress=tokenOutAddress,
        tokenInDecimals=tokenInDecimals,
        wethContractABI=wethContractABI,
        predictions=predictions,
        stepNumber=stepNumber
    )

    balanceAfterBridge = getTokenBalance(fromChainRPC=toChainRPCURL, tokenAddress=tokenOutAddress,
                                         tokenDecimals=tokenInDecimals, wethContractABI=wethContractABI)

    actualBridgedAmount = balanceAfterBridge - balanceBeforeBridge

    result = {
        "successfull": fundsBridged,
        "bridgeOutput": actualBridgedAmount,
        "fee": getTokenNormalValue(transactionResult["gasUsed"] * web3.toWei(gasPriceWei, 'gwei'), 18),
        "blockURL": transactionResult["explorerLink"],
        "hash": transactionResult["hash"],
        "telegramStatusMessage": transactionResult["telegramStatusMessage"]
    }

    return result
