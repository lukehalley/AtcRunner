from src.apis.firebaseDB.firebaseDB_Querys import fetchStrategy
from src.apis.telegramBot.telegramBot_Action import appendToMessage, updateStatusMessage
from src.arbitrage.arbitrage_Simulate import simulateStep
from src.chain.bridge.bridge_Actions import executeBridge
from src.chain.network.network_Actions import topUpWalletGas, checkAndApproveToken
from src.chain.network.network_Querys import getWalletsInformation
from src.chain.swap.swap_Querys import getSwapQuoteOut
from src.chain.swap.swap_Actions import swapToken, setupWallet
from src.utils.chain.chain_Calculations import getValueWithSlippage
from src.utils.logging.logging_Print import printSeperator, printArbitrageResult, printArbitrageRollbackComplete
from src.utils.logging.logging_Setup import getProjectLogger
from src.utils.math.math_Decimal import truncateDecimal
from src.utils.math.math_Percentage import percentageDifference
from src.utils.state.balance.state_getBalance import getRecipeTokenBalance
from src.utils.state.position.state_getPosition import getCurrentPositions
from src.utils.state.position.state_positionUtils import getOppositePosition
from src.utils.state.step.state_getStep import getCurrentStepNameAndNumber
from src.utils.state.token.state_getToken import getCurrentTokens

logger = getProjectLogger()

# Execute an Arbitrage
def executeArbitrage(recipe):

    # State Params ############################################################
    currentPosition, currentOppositePosition = getCurrentPositions(recipe=recipe)
    currentStepName, currentStepNumber = getCurrentStepNameAndNumber(recipe=recipe)
    currentToken, currentOppositeToken = getCurrentTokens(recipe=recipe)
    # State Params ############################################################

    steps = fetchStrategy(recipe=recipe, strategyType="arbitrage")

    printSeperator()
    logger.info(
        f"[ARB #{recipe['status']['currentRoundTrip']}] "
        f"Executing Arbitrage"
    )
    printSeperator()

    recipe = getWalletsInformation(recipe)

    for stepSettings in steps:

        stepType = stepSettings["type"]
        stepNumber = steps.index(stepSettings) + 1
        stepName = stepSettings["name"]

        position = stepSettings["position"]
        oppositePosition = getOppositePosition(position)
        toSwapFrom = stepSettings["from"]
        toSwapTo = stepSettings["to"]

        recipe, toppedUpOccured = topUpWalletGas(
            recipe=recipe,
            direction=position,
            toSwapFrom=toSwapFrom
        )

        recipe = getWalletsInformation(recipe)

        if stepNumber <= 1:

            stablecoinBalance = getRecipeTokenBalance(recipe=recipe, token="stablecoin")
            logger.info(f'Starting Capital: {stablecoinBalance} {recipe[position]["stablecoin"]["name"]}')
            printSeperator(True)

        if toSwapTo != "done":

            recipe = getWalletsInformation(recipe)
            currentStepBalance = getRecipeTokenBalance(recipe=recipe, token=toSwapFrom)

            printSeperator()

            logger.info(
                f'{stepNumber}. {stepType.title()} {truncateDecimal(balance, 6)} {recipe[position][toSwapFrom]["name"]} -> {recipe[position][toSwapTo]["name"]}')

            recipe = appendToMessage(recipe=recipe,
                                                    messageToAppend=f"{stepNumber}. Doing {position.title()} {stepType.title()} -> 📤")

            if stepType == "swap":

                amountOutQuoted = getSwapQuoteOut(
                    recipe=recipe,
                    recipeDirection=position,
                    recipeToken=toSwapFrom,
                    recipeTokenIsGas=recipe[position][toSwapFrom]["isGas"],
                    amountInNormal=getRecipeTokenBalance(recipe=recipe, token=toSwapFrom)
                )

                amountOutMinWithSlippage = getValueWithSlippage(amount=amountOutQuoted, slippage=0.5)

                recipe = checkAndApproveToken(
                    recipe=recipe, toSwapFrom=toSwapFrom, isSwap=True
                )

                recipe = getWalletsInformation(recipe)

                balanceBeforeSwap = recipe[position]["wallet"]["balances"][toSwapTo]

                swapResult = swapToken(
                    amountInNormal=balance,
                    amountInDecimals=recipe[position][toSwapFrom]["decimals"],
                    amountOutNormal=amountOutMinWithSlippage,
                    amountOutDecimals=recipe[position][toSwapTo]["decimals"],
                    tokenPath=swapRoute,
                    rpcURL=recipe[position]["chain"]["rpc"],
                    roundTrip=recipe["status"]["currentRoundTrip"],
                    stepCategory=f"{stepNumber}_swap",
                    explorerUrl=recipe[position]["chain"]["blockExplorer"]["txBaseURL"],
                    routerAddress=recipe[position]["chain"]["contracts"]["router"]["address"],
                    routerABI=recipe[position]["chain"]["contracts"]["router"]["abi"],
                    routerABIMappings=recipe[position]["chain"]["contracts"]["router"]["mapping"],
                    wethContractABI=recipe[position]["chain"]["contracts"]["weth"]["abi"],
                    telegramStatusMessage=telegramStatusMessage,
                    swappingFromGas=recipe[position][toSwapFrom]["isGas"],
                    swappingToGas=recipe[position][toSwapTo]["isGas"]
                )

                recipe = getWalletsInformation(recipe)

                balanceAfterSwap = recipe[position]["wallet"]["balances"][toSwapTo]

                while balanceAfterSwap == balanceBeforeSwap:
                    recipe = getWalletsInformation(recipe)
                    balanceAfterSwap = recipe[position]["wallet"]["balances"][toSwapTo]

                result = balanceAfterSwap - balanceBeforeSwap

                currentFunds[toSwapTo] = result

                telegramStatusMessage = swapResult["telegramStatusMessage"]

            elif stepType == "bridge":

                if stepName == "destinationBridge":

                    quote = simulateStep(recipe=recipe, stepSettings=stepSettings, currentFunds=currentFunds)

                    if quote < startingStables:
                        recipe = appendToMessage(recipe=recipe,
                                                                messageToAppend=f"Rolling Back Arbitrage #{recipe['status']['currentRoundTrip']} ‍⏮")

                        wasProfitable, telegramStatusMessage = rollbackArbitrage(recipe=recipe,
                                                                                 currentFunds=currentFunds,
                                                                                 startingStables=startingStables,
                                                                                 startingTime=startingTime,
                                                                                 telegramStatusMessage=telegramStatusMessage)

                        return wasProfitable

                if not recipe[position][toSwapFrom]["isGas"]:
                    telegramStatusMessage = checkAndApproveToken(
                        recipe=recipe, position=position, toSwapFrom=toSwapFrom, stepNumber=stepNumber,
                        isSwap=False, telegramStatusMessage=telegramStatusMessage
                    )

                recipe = getWalletsInformation(recipe)

                balanceBeforeBridge = recipe[oppositePosition]["wallet"]["balances"][toSwapFrom]

                bridgeResult = executeBridge(
                    recipe=recipe,
                    tokenToBridge=toSwapFrom
                )

                recipe = getWalletsInformation(recipe)
                balanceAfterBridge = recipe[oppositePosition]["wallet"]["balances"][toSwapFrom]

                while balanceAfterBridge == balanceBeforeBridge:
                    recipe = getWalletsInformation(recipe)
                    balanceAfterBridge = recipe[oppositePosition]["wallet"]["balances"][toSwapFrom]

                result = balanceAfterBridge - balanceBeforeBridge

                balance = result

                telegramStatusMessage = bridgeResult["telegramStatusMessage"]

            else:
                updateStatusMessage(originalMessage=telegramStatusMessage, newStatus="⛔️")
                errMsg = f'Invalid Arbitrage execution type: {stepType}'
                logger.error(errMsg)
                raise Exception(errMsg)

            recipe = getWalletsInformation(recipe)

            printSeperator()

            logger.info(f'Output: {truncateDecimal(result, 6)} {recipe[position][toSwapTo]["name"]}')
            telegramStatusMessage = updateStatusMessage(originalMessage=telegramStatusMessage, newStatus="✅")

            stepSettings["done"] = True

            printSeperator(True)

        else:

            recipe = getWalletsInformation(recipe)

            wasProfitable = recipe[position]["wallet"]["balances"]["stablecoin"] > startingStables
            profitLoss = abs(recipe[position]["wallet"]["balances"]["stablecoin"] - startingStables)

            if wasProfitable:
                arbitragePercentage = percentageDifference(recipe[position]["wallet"]["balances"]["stablecoin"],
                                                           startingStables, 2)
            else:
                arbitragePercentage = percentageDifference(startingStables,
                                                           recipe[position]["wallet"]["balances"]["stablecoin"], 2)

            printArbitrageResult(recipe=recipe,
                                 count=recipe["status"]["currentRoundTrip"], amount=profitLoss,
                                 percentageDifference=arbitragePercentage, wasProfitable=wasProfitable,
                                 startingTime=startingTime)

            return wasProfitable

# Rollback an Arbitrage
def rollbackArbitrage(recipe, currentFunds, startingStables, startingTime, telegramStatusMessage):
    steps = fetchStrategy(recipe=recipe, strategyType="rollback")

    printSeperator(True)

    printSeperator()
    logger.info(f"[ARB #{recipe['status']['currentRoundTrip']}] "
                f"Rolling Back Arbitrage")
    printSeperator(True)

    normalStepCount = 4

    for stepSettings in steps:

        printSeperator()

        stepType = stepSettings["type"]
        stepNumber = steps.index(stepSettings) + 1 + normalStepCount

        position = stepSettings["position"]
        oppositePosition = getOppositePosition(position)
        toSwapFrom = stepSettings["from"]
        toSwapTo = stepSettings["to"]

        recipe, toppedUpOccured, telegramStatusMessage = topUpWalletGas(
            recipe=recipe,
            direction=position,
            toSwapFrom=toSwapFrom,
            telegramStatusMessage=telegramStatusMessage,
        )

        if toppedUpOccured:
            currentFunds["stablecoin"] = recipe[position]["wallet"]["balances"]["stablecoin"]
            currentFunds["token"] = recipe[position]["wallet"]["balances"]["token"]

        recipe = getWalletsInformation(recipe)

        recipe = getWalletsInformation(recipe)

        logger.info(
            f'{stepNumber}. {stepType.title()} {truncateDecimal(balance, 6)} {recipe[position][toSwapFrom]["name"]} -> {recipe[position][toSwapTo]["name"]}')

        recipe = appendToMessage(recipe=recipe,
                                                messageToAppend=f"{stepNumber}. RBack {position.title()} {stepType.title()} -> 📤")

        if stepType == "swap":

            balanceBeforeSwap = recipe[position]["wallet"]["balances"][toSwapTo]

            amountOutQuoted = getSwapQuoteOut(
                recipe=recipe,
                recipeDirection=position,
                recipeToken=toSwapFrom,
                recipeTokenIsGas=recipe[position][toSwapFrom]["isGas"],
                amountInNormal=balance
            )

            amountOutMinWithSlippage = getValueWithSlippage(amount=amountOutQuoted, slippage=0.5)

            telegramStatusMessage = checkAndApproveToken(
                recipe=recipe, position=position, toSwapFrom=toSwapFrom, stepNumber=stepNumber,
                isSwap=True, telegramStatusMessage=telegramStatusMessage
            )

            swapResult = swapToken(
                amountInNormal=balance,
                amountInDecimals=recipe[position][toSwapFrom]["decimals"],
                amountOutNormal=amountOutMinWithSlippage,
                amountOutDecimals=recipe[position][toSwapTo]["decimals"],
                tokenPath=swapRoute,
                rpcURL=recipe[position]["chain"]["rpc"],
                roundTrip=recipe["status"]["currentRoundTrip"],
                stepCategory=f"{stepNumber}_swap",
                explorerUrl=recipe[position]["chain"]["blockExplorer"]["txBaseURL"],
                routerAddress=recipe[position]["chain"]["contracts"]["router"]["address"],
                routerABI=recipe[position]["chain"]["contracts"]["router"]["abi"],
                routerABIMappings=recipe[position]["chain"]["contracts"]["router"]["mapping"],
                wethContractABI=recipe[position]["chain"]["contracts"]["weth"]["abi"],
                telegramStatusMessage=telegramStatusMessage,
                swappingFromGas=recipe[position][toSwapFrom]["isGas"],
                swappingToGas=recipe[position][toSwapTo]["isGas"]
            )

            recipe = getWalletsInformation(recipe)

            balanceAfterSwap = recipe[position]["wallet"]["balances"][toSwapTo]

            while balanceAfterSwap == balanceBeforeSwap:
                recipe = getWalletsInformation(recipe)
                balanceAfterSwap = recipe[position]["wallet"]["balances"][toSwapTo]

            result = balanceAfterSwap - balanceBeforeSwap

            currentFunds[toSwapTo] = result

            telegramStatusMessage = swapResult["telegramStatusMessage"]

        elif stepType == "bridge":

            balanceBeforeBridge = recipe[oppositePosition]["wallet"]["balances"][toSwapFrom]

            telegramStatusMessage = checkAndApproveToken(
                recipe=recipe, position=position, toSwapFrom=toSwapFrom, stepNumber=stepNumber,
                isSwap=False, telegramStatusMessage=telegramStatusMessage
            )

            bridgeResult = executeBridge(
                amountToBridge=balance,
                fromChain=recipe[position]["chain"]["id"],
                fromTokenAddress=recipe[position][toSwapFrom]['address'],
                fromTokenDecimals=recipe[position][toSwapFrom]["decimals"],
                fromChainRPCURL=recipe[position]["chain"]["rpc"],
                toChain=recipe[oppositePosition]["chain"]["id"],
                toTokenDecimals=recipe[oppositePosition][toSwapFrom]['decimals'],
                toTokenAddress=recipe[oppositePosition][toSwapFrom]['address'],
                toChainRPCURL=recipe[oppositePosition]["chain"]["rpc"],
                wethContractABI=recipe[position]["chain"]["contracts"]["weth"]["abi"],
                roundTrip=recipe["status"]["currentRoundTrip"],
                stepCategory=f"{stepNumber}_bridge",
                explorerUrl=recipe[position]["chain"]["blockExplorer"]["txBaseURL"],
                telegramStatusMessage=telegramStatusMessage,
                predictions=None,
                stepNumber=stepNumber
            )

            recipe = getWalletsInformation(recipe)
            balanceAfterBridge = recipe[oppositePosition]["wallet"]["balances"][toSwapFrom]

            while balanceAfterBridge == balanceBeforeBridge:
                recipe = getWalletsInformation(recipe)
                balanceAfterBridge = recipe[oppositePosition]["wallet"]["balances"][toSwapFrom]

            result = balanceAfterBridge - balanceBeforeBridge

            balance = result

            telegramStatusMessage = bridgeResult["telegramStatusMessage"]

        else:
            updateStatusMessage(originalMessage=telegramStatusMessage, newStatus="⛔️")
            errMsg = f'Invalid Arbitrage execution type: {stepType}'
            logger.error(errMsg)
            raise Exception(errMsg)

        recipe = getWalletsInformation(recipe)

        printSeperator()

        logger.info(f'Output: {truncateDecimal(result, 6)} {recipe[position][toSwapTo]["name"]}')
        telegramStatusMessage = updateStatusMessage(originalMessage=telegramStatusMessage, newStatus="✅")

        stepSettings["done"] = True

        printSeperator(True)

    setupWallet(recipe=recipe)

    printSeperator(True)

    recipe = getWalletsInformation(recipe)

    wasProfitable = recipe["origin"]["wallet"]["balances"]["stablecoin"] > startingStables
    profitLoss = abs(recipe["origin"]["wallet"]["balances"]["stablecoin"] - startingStables)

    if wasProfitable:
        arbitragePercentage = percentageDifference(recipe["origin"]["wallet"]["balances"]["stablecoin"],
                                                   startingStables, 2)
    else:
        arbitragePercentage = percentageDifference(startingStables,
                                                   recipe["origin"]["wallet"]["balances"]["stablecoin"], 2)

    printArbitrageRollbackComplete(recipe=recipe,
                                   count=recipe["status"]["currentRoundTrip"], wasProfitable=wasProfitable,
                                   profitLoss=profitLoss, arbitragePercentage=arbitragePercentage)

    return wasProfitable, telegramStatusMessage
