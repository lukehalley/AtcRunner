import os
from decimal import Decimal

from retry import retry
from web3 import Web3

from src.apis.telegramBot.telegramBot_Action import updateStatusMessage, appendToMessage
from src.arbitrage.arbitrage_Utils import getOppositeToken, getRoutes
from src.chain.network.network_Actions import buildMappedContractFunction, signAndSendTransaction, checkAndApproveToken
from src.chain.network.network_Querys import getWalletsInformation, getWalletGasBalance, getTokenBalance
from src.chain.swap.swap_Querys import getSwapQuoteOut, normaliseSwapRoutes
from src.utils.chain.chain_ABI import getMappedContractFunction
from src.utils.chain.chain_Calculations import getValueWithSlippage, getTransactionDeadline
from src.utils.chain.chain_Wallet import getPrivateKey
from src.utils.chain.chain_Wei import getTokenDecimalValue, getTokenNormalValue
from src.utils.logging.logging_Print import printSettingUpWallet, printSeparator
from src.utils.logging.logging_Setup import getProjectLogger
from src.utils.math.math_Decimal import truncateDecimal
from src.utils.retry.retry_Params import getRetryParams

logger = getProjectLogger()

transactionTimeout = getTransactionDeadline()
transactionRetryLimit, transactionRetryDelay, = getRetryParams(retryType="transactionAction")

def setupWallet(recipe, recipePosition, tokenType, stepCategory):
    
    # Dict Params ####################################################
    tokenTypeOpposite = getOppositeToken(tokenType)
    recipeDex = recipe[recipePosition]["chain"]["primaryDex"]
    # Dict Params ####################################################
    
    originHasStablecoins = recipe["origin"]["wallet"]["balances"]["stablecoin"] > 0.1
    originHasTokens = recipe["origin"]["wallet"]["balances"]["token"] > 0

    if not originHasTokens and not originHasStablecoins:
        errMsg = f'Origin wallet has neither Tokens or Stablecoins!'
        logger.error(errMsg)
        raise Exception(errMsg)
    elif not originHasStablecoins:

        recipe["status"]["telegramStatusMessage"] = printSettingUpWallet(recipe['status']['currentRoundTrip'])

        # Update The Telegram Status Message
        recipe["status"]["telegramStatusMessage"] = appendToMessage(
            messageToAppendTo=recipe["status"]["telegramStatusMessage"],
            messageToAppend=f"- 1. {recipePosition.title()} {stepCategory.title()} -> 📤"
        )

        recipe = swapToken(
            recipe=recipe,
            recipePosition=recipePosition,
            recipeDex=recipeDex,
            tokenInType=tokenType,
            stepCategory=stepCategory,
            stepNumber=0
        )

        recipe = getWalletsInformation(
            recipe=recipe
        )

        printSeparator()

        logger.info(
            f'Output: {truncateDecimal(recipe[recipePosition]["wallet"]["balances"][tokenTypeOpposite], 6)} '
            f'{recipe[recipePosition][tokenTypeOpposite]["name"]}'
        )

        recipe["status"]["telegramStatusMessage"] = updateStatusMessage(
            originalMessage=recipe["status"]["telegramStatusMessage"],
            newStatus="✅"
        )

        printSeparator(newLine=True)

        return recipe

@retry(tries=transactionRetryLimit, delay=transactionRetryDelay, logger=logger)
def swapToken(recipe, recipePosition, recipeDex, tokenInType, stepCategory, stepNumber, overrideAmountIn=None, overrideSwappingToGas=False):
    
    # Dict Params ####################################################
    # Token Types
    if overrideSwappingToGas:
        tokenOutType = "gas"
    else:
        tokenOutType = getOppositeToken(tokenInType)

    tokenInDecimals = recipe[recipePosition][tokenInType]["decimals"]
    tokenOutDecimals = recipe[recipePosition][tokenOutType]["decimals"]
    swappingFromGas = recipe[recipePosition][tokenInType]["isGas"]
    swappingToGas = recipe[recipePosition][tokenOutType]["isGas"] or overrideSwappingToGas
    # Static Params
    rpcUrl = recipe[recipePosition]["chain"]["rpc"]
    routerAddress = recipe[recipePosition]["dexs"][recipeDex]["router"]["address"]
    routerABI = recipe[recipePosition]["dexs"][recipeDex]["router"]["abi"]
    routerABIMappings = recipe[recipePosition]["dexs"][recipeDex]["router"]["mapping"]
    # Dict Params ####################################################

    # Get Wallet Balances
    recipe = getWalletsInformation(
        recipe=recipe
    )

    # Get Token Balance Before We Swap
    balanceBeforeSwap = recipe[recipePosition]["wallet"]["balances"][tokenOutType]

    if overrideAmountIn:
        tokenInAmount = overrideAmountIn
    else:
        tokenInAmount = recipe[recipePosition]["wallet"]["balances"][tokenInType]

    # First Get A Quote
    amountOutQuoted = getSwapQuoteOut(
        recipe=recipe,
        recipePosition=recipePosition,
        recipeDex=recipe[recipePosition]["chain"]["primaryDex"],
        tokenType=tokenInType,
        tokenIsGas=recipe[recipePosition][tokenInType]["isGas"],
        tokenAmountIn=tokenInAmount
    )

    # Calculate Min Out With Slippage
    amountOutMinWithSlippage = getValueWithSlippage(
        amount=amountOutQuoted,
        slippage=0.5
    )

    tokenOutAmount = amountOutMinWithSlippage

    # Get The Swap Routes For Our Token And Normalise Them
    if swappingToGas:
        routes = [recipe[recipePosition][tokenInType]["address"], recipe[recipePosition]["gas"]["address"]]
    elif swappingFromGas:
        routes = [recipe[recipePosition]["gas"]["address"], recipe[recipePosition][tokenOutType]["address"]]
    else:
        routes = getRoutes(
            recipe=recipe,
            recipePosition=recipePosition,
            tokenType=tokenInType
        )

    normalisedRoutes = normaliseSwapRoutes(routes)

    # Setup Web3
    web3 = Web3(Web3.HTTPProvider(rpcUrl))
    privateKey = getPrivateKey()
    walletAddress = web3.eth.account.privateKeyToAccount(privateKey).address
    web3.eth.default_account = walletAddress

    # Create Transaction Params
    transactionNonce = web3.eth.getTransactionCount(walletAddress, 'pending')
    transactionGasPriceWei = web3.fromWei(web3.eth.gas_price, 'gwei')
    transactionContract = web3.eth.contract(routerAddress, abi=routerABI)
    transactionDeadline = getTransactionDeadline(timeInSeconds=transactionTimeout)

    # Create Transaction Object
    txParams = {
        'gasPrice': web3.toWei(transactionGasPriceWei, 'gwei'),
        'nonce': transactionNonce,
        'gas': int(os.environ.get("SWAP_GAS"))
    }

    # Get Amount In + Out In Wei
    amountInWei = getTokenDecimalValue(
        amount=tokenInAmount,
        decimalPlaces=tokenInDecimals
    )
    amountOutWei = getTokenDecimalValue(
        amount=tokenOutAmount,
        decimalPlaces=tokenOutDecimals
    )

    approvalOccured = False
    if not swappingFromGas:

        # Before We Swap Check If We Need To First Approve The Token To Be Spent
        recipe, approvalOccured = checkAndApproveToken(
            recipe=recipe,
            recipePosition=recipePosition,
            recipeDex=recipeDex,
            tokenType=tokenInType,
            stepNumber=stepNumber,
            approvalType=stepCategory
        )

        if approvalOccured:
            logger.info("Approval Complete - Continuing With Swap")

    # Check If We Are Swapping To A Gas Token
    if swappingToGas:

        # Build A List Of Params Which Will Be Passed To Contract
        contractParams = [
            amountInWei,
            amountOutWei,
            normalisedRoutes,
            walletAddress,
            transactionDeadline
        ]

        # Get The Current Network's Equivalent Of 'swapExactTokensForETH'
        swapExactTokensForETHFunctionName = getMappedContractFunction(
            functionName="swapExactTokensForETH",
            abiMapping=routerABIMappings
        )

        # Build A Transaction For This Function
        tx = buildMappedContractFunction(
            contract=transactionContract,
            functionToCall=swapExactTokensForETHFunctionName,
            txParams=txParams,
            functionParams=contractParams
        )

    # Check If We Are Swapping From A Gas Token
    elif swappingFromGas:

        # Build A List Of Params Which Will Be Passed To Contract
        contractParams = [
            amountOutWei,
            normalisedRoutes,
            walletAddress,
            transactionDeadline
        ]

        # Get The Current Network's Equivalent Of 'swapExactETHForTokens'
        swapExactETHForTokensFunctionName = getMappedContractFunction(functionName="swapExactETHForTokens",
                                                                      abiMapping=routerABIMappings)

        # Build A Transaction For This Function
        tx = buildMappedContractFunction(contract=transactionContract, functionToCall=swapExactETHForTokensFunctionName,
                                         txParams=txParams, functionParams=contractParams)

        # Add The Value Param
        tx["value"] = amountInWei

    else:

        # Build A List Of Params Which Will Be Passed To Contract
        contractParams = [
            amountInWei,
            amountOutWei,
            normalisedRoutes,
            walletAddress,
            transactionDeadline
        ]

        # Get The Current Network's Equivalent Of 'swapExactTokensForTokens'
        swapExactTokensForTokensFunctionName = getMappedContractFunction(functionName="swapExactTokensForTokens",
                                                                         abiMapping=routerABIMappings)

        # Build A Transaction For This Function
        tx = buildMappedContractFunction(contract=transactionContract,
                                         functionToCall=swapExactTokensForTokensFunctionName,
                                         txParams=txParams, functionParams=contractParams)

    # Sign The Transaction And Send It
    recipe, transactionResult = signAndSendTransaction(
        tx=tx,
        recipe=recipe,
        recipePosition=recipePosition,
        stepCategory=stepCategory
    )

    # Get Wallet Balance After Top Up
    recipe = getWalletsInformation(
        recipe=recipe
    )

    # Get The Balance After Swap So We Know How Much Tokens We Gained
    balanceAfterSwap = recipe[recipePosition]["wallet"]["balances"][tokenOutType]

    # Wait For The Tokens To Arrive In Out Wallet
    while balanceAfterSwap == balanceBeforeSwap:
        recipe = getWalletsInformation(
            recipe=recipe
        )
        balanceAfterSwap = recipe[recipePosition]["wallet"]["balances"][tokenOutType]

    if approvalOccured:
        recipe["status"]["telegramStatusMessage"] = updateStatusMessage(
            originalMessage=recipe["status"]["telegramStatusMessage"],
            newStatus="✅",
            lineIndex=-2
        )

    return recipe
