import os
from decimal import Decimal

from web3 import Web3

from src.apis.telegramBot.telegramBot_Action import updateStatusMessage
from src.arbitrage.arbitrage_Utils import getOppositeToken, getRoutes
from src.chain.network.network_Actions import buildMappedContractFunction, signAndSendTransaction
from src.chain.network.network_Querys import getWalletsInformation, getWalletGasBalance, getTokenBalance
from src.chain.swap.swap_Querys import getSwapQuoteOut, normaliseSwapRoutes
from src.utils.chain.chain_ABI import getMappedContractFunction
from src.utils.chain.chain_Calculations import getValueWithSlippage, getTransactionDeadline
from src.utils.chain.chain_Wallet import getPrivateKey
from src.utils.chain.chain_Wei import getTokenDecimalValue, getTokenNormalValue
from src.utils.logging.logging_Print import printSettingUpWallet, printSeparator
from src.utils.logging.logging_Setup import getProjectLogger
from src.utils.math.math_Decimal import truncateDecimal

logger = getProjectLogger()

transactionTimeout = getTransactionDeadline()


def setupWallet(recipe, recipePosition, tokenType, stepCategory):
    
    # Dict Params ####################################################
    tokenTypeOpposite = getOppositeToken(tokenType)
    # Dict Params ####################################################
    
    originHasStablecoins = recipe["origin"]["wallet"]["balances"]["stablecoin"] > 0.1
    originHasTokens = recipe["origin"]["wallet"]["balances"]["token"] > 0

    if not originHasTokens and not originHasStablecoins:
        errMsg = f'Origin wallet has neither Tokens or Stablecoins!'
        logger.error(errMsg)
        raise Exception(errMsg)
    elif not originHasStablecoins:

        recipe["status"]["telegramStatusMessage"] = printSettingUpWallet(recipe['status']['currentRoundTrip'])

        if recipe[recipePosition][tokenType]["isGas"]:
            maximumGasBalance = Decimal(os.environ.get("MAX_GAS_BALANCE"))
            amountInNormal = abs(recipe[recipePosition]["wallet"]["balances"][tokenType] - maximumGasBalance)
        else:
            amountInNormal = recipe[recipePosition]["wallet"]["balances"][tokenType]

        balanceBeforeSwap = recipe[recipePosition]["wallet"]["balances"][tokenTypeOpposite]

        amountOutQuoted = getSwapQuoteOut(
            recipe=recipe,
            recipePosition=recipePosition,
            tokenType=tokenType,
            tokenIsGas=recipe[recipePosition][tokenType]["isGas"],
            tokenAmountIn=amountInNormal
        )

        amountOutMinWithSlippage = getValueWithSlippage(amount=amountOutQuoted, slippage=0.5)

        recipe = swapToken(
            recipe=recipe,
            recipePosition=recipePosition,
            tokenInAmount=amountInNormal,
            tokenOutAmount=amountOutMinWithSlippage,
            tokenType=tokenType,
            stepCategory=stepCategory
        )

        recipe = getWalletsInformation(
            recipe=recipe
        )

        balanceAfterSwap = recipe[recipePosition]["wallet"]["balances"][tokenTypeOpposite]

        while balanceAfterSwap == balanceBeforeSwap:
            recipe = getWalletsInformation(
                recipe=recipe
            )
            balanceAfterSwap = recipe[recipePosition]["wallet"]["balances"][tokenTypeOpposite]

        result = balanceAfterSwap - balanceBeforeSwap

        recipe = getWalletsInformation(
            recipe=recipe
        )

        printSeparator()

        logger.info(f'Output: {truncateDecimal(result, 6)} {recipe[recipePosition][tokenTypeOpposite]["name"]}')

        recipe["status"]["telegramStatusMessage"] = updateStatusMessage(originalMessage=recipe["status"]["telegramStatusMessage"], newStatus="✅")

        printSeparator(newLine=True)

        return recipe


def swapToken(recipe, recipePosition, tokenInAmount, tokenOutAmount, tokenType, stepCategory):
    
    # Dict Params ####################################################
    # Token Types
    tokenTypeOpposite = getOppositeToken(tokenType)
    tokenInDecimals = recipe[recipePosition][tokenType]["decimals"]
    tokenDecimalsOut = recipe[recipePosition][tokenTypeOpposite]["decimals"]
    swappingFromGas = recipe[recipePosition][tokenType]["isGas"]
    swappingToGas = recipe[recipePosition][tokenTypeOpposite]["isGas"]
    # Static Params
    rpcUrl = recipe[recipePosition]["chain"]["rpc"]
    routerAddress = recipe[recipePosition]["chain"]["contracts"]["router"]["address"]
    routerABI = recipe[recipePosition]["chain"]["contracts"]["router"]["abi"]
    routerABIMappings = recipe[recipePosition]["chain"]["contracts"]["router"]["mapping"]
    wethContractABI = recipe[recipePosition]["chain"]["contracts"]["weth"]["abi"]
    explorerUrl = recipe[recipePosition]["chain"]["blockExplorer"]["txBaseURL"]
    # Dict Params ####################################################

    # Get The Swap Routes For Our Token And Normalise Them
    if swappingFromGas:
        routes = [recipe[recipePosition]["gas"]["address"], recipe[recipePosition]["stablecoin"]["address"]]
    else:
        routes = getRoutes(
            recipe=recipe,
            recipePosition=recipePosition,
            tokenType=tokenType
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
        decimalPlaces=tokenDecimalsOut
    )

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

    # Check The Balance Og The Token Before We Swap
    # So We Know The True Amount We Gained
    if swappingToGas:
        balanceBeforeSwap = getWalletGasBalance(
            rpcUrl=rpcUrl,
            walletAddress=walletAddress,
            wethContractABI=wethContractABI
        )
    else:
        balanceBeforeSwap = getTokenBalance(
            fromChainRPCUrl=rpcUrl,
            tokenAddress=normalisedRoutes[-1],
            tokenDecimals=tokenDecimalsOut,
            wethContractABI=wethContractABI
        )

    # Sign The Transaction And Send It
    signAndSendTransaction(
        tx=tx,
        recipe=recipe,
        recipePosition=recipePosition,
        stepCategory=stepCategory
    )

    # After The Swap, Calculate What We Truly Gained
    balanceAfterSwap = balanceBeforeSwap
    while balanceAfterSwap <= balanceBeforeSwap:
        if swappingToGas:
            balanceAfterSwap = getWalletGasBalance(rpcUrl=rpcUrl, walletAddress=walletAddress,
                                                   wethContractABI=wethContractABI)
        else:
            balanceAfterSwap = getTokenBalance(fromChainRPCUrl=rpcUrl, tokenAddress=normalisedRoutes[-1],
                                               tokenDecimals=tokenDecimalsOut, wethContractABI=wethContractABI)

    return recipe
