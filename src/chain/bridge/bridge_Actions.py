import os

from retry import retry
from web3 import Web3

from src.apis.synapseBridge.synapseBridge_Generate import generateUnsignedBridgeTransaction
from src.apis.telegramBot.telegramBot_Action import updateStatusMessage
from src.arbitrage.arbitrage_Utils import getOppositeToken, getOppositePosition
from src.chain.bridge.bridge_Querys import waitForBridgeToComplete
from src.chain.network.network_Actions import signAndSendTransaction, checkAndApproveToken
from src.chain.network.network_Querys import getWalletAddressFromPrivateKey, getTokenBalance, getWalletsInformation
from src.utils.chain.chain_Calculations import getTransactionDeadline
from src.utils.chain.chain_Wei import getTokenDecimalValue, getTokenNormalValue
from src.utils.logging.logging_Setup import getProjectLogger
from src.utils.retry.retry_Params import getRetryParams

logger = getProjectLogger()

transactionTimeout = getTransactionDeadline()
transactionRetryLimit, transactionRetryDelay, = getRetryParams(retryType="transactionAction")

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def executeBridge(recipe, recipePosition, tokenType, stepCategory, stepNumber):

    # Dict Params ####################################################
    oppositePosition = getOppositePosition(direction=recipePosition)
    predictions = recipe["arbitrage"]["predictions"]
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
    recipeDex = recipe[recipePosition]["chain"]["primaryDex"]
    wethContractABI = recipe[recipePosition]["dexs"][recipeDex]["chain"]["contracts"]["weth"]["abi"]
    # Dict Params ####################################################

    # Get Wallet Address From Private Key
    walletAddress = getWalletAddressFromPrivateKey(
        rpcUrl=fromChainRPCUrl
    )

    # Get Token Balance Before We Bridge
    recipe = getWalletsInformation(
        recipe=recipe
    )

    # Get The Amount We Want To Bridge In Wei
    amountToBridgeWei = getTokenDecimalValue(
        amount=recipe[recipePosition]["wallet"]["balances"][tokenType],
        decimalPlaces=tokenInDecimals
    )

    # Get Token Balance Before We Bridge
    balanceBeforeBridge = recipe[oppositePosition]["wallet"]["balances"][tokenTypeOpposite]

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

    # Build Our Full Bridge Transaction Object
    tx = {
        'nonce': web3.eth.getTransactionCount(walletAddress, 'pending'),
        'to': bridgeTransaction["to"],
        'chainId': int(fromChain),
        'gas': int(os.environ.get("BRIDGE_GAS")),
        'gasPrice': web3.eth.gas_price,
        'data': bridgeTransaction["unsigned_data"],
        'value': int(bridgeTransaction["value"])
    }

    # Check If We Are Swapping From Gas
    # If We Are We Don't Have To Approve It
    approvalOccured = False
    if not recipe[recipePosition][tokenType]["isGas"]:
        # Check If The The Token We Are Swapping To Needs To Be Approved
        # If So - Approve It
        recipe, approvalOccured = checkAndApproveToken(
            recipe=recipe,
            recipePosition=recipePosition,
            recipeDex=recipeDex,
            tokenType=tokenType,
            stepNumber=stepNumber,
            approvalType=stepCategory
        )

        if approvalOccured:
            logger.info("Approval Complete - Continuing With Bridge")

    # Sign + Send The Bridge Transaction
    recipe, transactionResult = signAndSendTransaction(
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

    if approvalOccured:
        recipe["status"]["telegramStatusMessage"] = updateStatusMessage(
            originalMessage=recipe["status"]["telegramStatusMessage"],
            newStatus="✅",
            lineIndex=-1
        )
        recipe["status"]["telegramStatusMessage"] = updateStatusMessage(
            originalMessage=recipe["status"]["telegramStatusMessage"],
            newStatus="✅",
            lineIndex=-2
        )

    # Get Token Balance After We Bridge
    recipe = getWalletsInformation(
        recipe=recipe
    )

    # Wait For Balance On Chain We Are Bridging On To Update
    while recipe[oppositePosition]["wallet"]["balances"][tokenType] == balanceBeforeBridge:
        recipe = getWalletsInformation(
            recipe=recipe
        )

    return recipe
