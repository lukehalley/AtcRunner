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
    oppositePosition = getOppositePosition(direction=recipePosition)
    # Token Params
    tokenTypeOpposite = getOppositeToken(tokenType)
    tokenInAddress = recipe[recipePosition][tokenType]["address"]
    tokenInDecimals = recipe[recipePosition][tokenType]["decimals"]
    tokenOutAddress = recipe[oppositePosition][tokenType]["address"]
    # Chains Params
    fromChain = recipe[recipePosition]["chain"]["id"]
    fromChainRPCUrl = recipe[recipePosition]["chain"]["rpc"]
    toChain = recipe[oppositePosition]["chain"]["id"]
    toChainRPCUrl = recipe[oppositePosition]["chain"]["rpc"]
    # Static Params
    predictions = recipe["arbitrage"]["predictions"]
    currentRoundTrip = recipe["status"]["currentRoundTrip"]
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
            fromChain=fromChain,
            toChain=toChain,
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
        'chainId': int(fromChain),
        'gas': int(os.environ.get("BRIDGE_GAS")),
        'gasPrice': web3.eth.gas_price,
        'data': bridgeTransaction["unsigned_data"],
        'value': int(bridgeTransaction["value"])
    }

    # Sign + Send The Bridge Transaction
    transactionResult = signAndSendTransaction(
        tx=tx,
        recipe=recipe,
        recipePosition=recipePosition,
        stepCategory=stepCategory
    )

    # Wait For Bridge To Complete
    waitForBridgeToComplete(
        transactionId=transactionResult["hash"],
        fromChain=fromChain,
        toChain=toChain,
        toChainRPCURL=toChainRPCUrl,
        toTokenAddress=tokenOutAddress,
        toTokenDecimals=tokenInDecimals,
        wethContractABI=wethContractABI,
        predictions=predictions,
        stepNumber=stepNumber
    )

    return recipe
