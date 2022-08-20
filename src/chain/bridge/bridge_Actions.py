import os

from web3 import Web3

from src.apis.synapseBridge.synapseBridge_Generate import generateUnsignedBridgeTransaction
from src.arbitrage.arbitrage_Utils import getOppositeToken, getOppositePosition
from src.chain.bridge.bridge_Querys import waitForBridgeToComplete
from src.chain.network.network_Actions import signAndSendTransaction
from src.chain.network.network_Querys import getWalletAddressFromPrivateKey, getTokenBalance
from src.utils.chain.chain_Wei import getTokenDecimalValue, getTokenNormalValue
from src.utils.logging.logging_Setup import getProjectLogger

logger = getProjectLogger()


def executeBridge(recipe, recipePosition, tokenAmountBridge, tokenType, stepCategory, stepNumber):

    # Dict Params ####################################################
    # Token Params
    tokenTypeOpposite = getOppositeToken(tokenType)
    tokenInAddress = recipe[recipePosition][tokenType]["address"]
    tokenInDecimals = recipe[recipePosition][tokenType]["decimals"]
    tokenOutAddress = recipe[tokenTypeOpposite][tokenType]["address"]
    # Chains Params
    oppositePosition = getOppositePosition(direction=recipePosition)
    fromChainId = recipe[recipePosition]["chain"]["id"]
    fromChainRPCUrl = recipe[recipePosition]["chain"]["rpc"]
    toChainId = recipe[tokenTypeOpposite]["chain"]["id"]
    toChainRPCUrl = recipe[oppositePosition]["chain"]["rpc"]
    # Static Params
    predictions = recipe["arbitrage"]["predictions"]
    currentRoundTrip = recipe["status"]["currentRoundTrip"]
    telegramStatusMessage = recipe["status"]["telegramMessage"]
    # Dict Params ####################################################

    wethContractABI = recipe[recipePosition]["chain"]["contracts"]["weth"]["abi"]
    explorerUrl = recipe[recipePosition]["chain"]["blockExplorer"]["txBaseURL"]
    # Dict Params ####################################################

    # Get Wallet Address From Private Key
    walletAddress = getWalletAddressFromPrivateKey(
        rpcUrl=fromChainRPCUrl
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

    # If Our Transaction Doesnt Return With The
    # The Value Param - Add It
    if "value" not in bridgeTransaction:
        bridgeTransaction["value"] = "0"

    # Setup Web 3
    web3 = Web3(Web3.HTTPProvider(fromChainRPCUrl))

    # Get The Current Price Of Gas
    gasPriceWei = web3.fromWei(web3.eth.gas_price, 'gwei')

    # Build Our Full Bridge Transaction
    tx = {
        'nonce': web3.eth.getTransactionCount(walletAddress, 'pending'),
        'to': bridgeTransaction["to"],
        'chainId': int(fromChainId),
        'gas': int(os.environ.get("BRIDGE_GAS")),
        'gasPrice': web3.eth.gas_price,
        'data': bridgeTransaction["unsigned_data"],
        'value': int(bridgeTransaction["value"])
    }

    # Get The Current Balance Of The Token On The
    # Destination Chain So We Know How We Bridged
    balanceBeforeBridge = getTokenBalance(
        fromChainRPCUrl=toChainRPCUrl,
        tokenAddress=tokenOutAddress,
        tokenDecimals=tokenInDecimals,
        wethContractABI=wethContractABI
    )

    # Sign + Send The Bridge Transaction
    transactionResult = signAndSendTransaction(
        tx=tx,
        fromChainRPCUrl=fromChainRPCUrl,
        explorerUrl=explorerUrl,
        currentRoundTrip=currentRoundTrip,
        stepCategory=stepCategory,
        telegramStatusMessage=telegramStatusMessage
    )

    # Wait For Bridge To Complete
    fundsBridged = waitForBridgeToComplete(
        transactionId=transactionResult["hash"],
        fromChainId=fromChainId,
        toChainId=toChainId,
        toChainRPCURL=toChainRPCUrl,
        tokenOutAddress=tokenOutAddress,
        tokenInDecimals=tokenInDecimals,
        wethContractABI=wethContractABI,
        predictions=predictions,
        stepNumber=stepNumber
    )

    # Get The Updated Balance Of The Token On The
    # Destination Chain After Bridge
    balanceAfterBridge = getTokenBalance(
        fromChainRPCUrl=toChainRPCUrl,
        tokenAddress=tokenOutAddress,
        tokenDecimals=tokenInDecimals,
        wethContractABI=wethContractABI
    )

    # Get The True Amount We Gained From Bridge
    actualBridgedAmount = balanceAfterBridge - balanceBeforeBridge

    # Build The Bridge Result Object
    result = {
        "successfull": fundsBridged,
        "bridgeOutput": actualBridgedAmount,
        "fee": getTokenNormalValue(transactionResult["gasUsed"] * web3.toWei(gasPriceWei, 'gwei'), 18),
        "blockURL": transactionResult["explorerLink"],
        "hash": transactionResult["hash"],
        "telegramStatusMessage": transactionResult["telegramStatusMessage"]
    }

    return result
