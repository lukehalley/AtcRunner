from src.apis.firebaseDB.firebaseDB_Querys import fetchStrategy
from src.apis.telegramBot.telegramBot_Action import appendToMessage, updateStatusMessage
from src.arbitrage.arbitrage_Simulate import simulateStep
from src.arbitrage.arbitrage_Utils import getOppositeDirection
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

logger = getProjectLogger()


# Execute an Arbitrage
def executeArbitrage(recipe):

    # Print Arb Info
    printSeperator()
    logger.info(
        f"[ARB #{recipe['status']['currentRoundTrip']}] "
        f"Executing Arbitrage"
    )
    printSeperator()

    # Fetch Arbitrage Strategy
    steps = fetchStrategy(recipe=recipe, strategyType="arbitrage")

    # Collect Initial Wallet Balances
    recipe = getWalletsInformation(recipe)
    startingStables = recipe["origin"]["wallet"]["balances"]["stablecoin"]
    recipe["status"]["startingStables"] = startingStables

    # Used To Track Arb Balance
    currentFunds = {
        "stablecoin": startingStables,
        "token": 0
    }

    # Iterate Through Arb Sets
    for stepSettings in steps:

        # Get Current Step Metadata
        stepCategory = stepSettings["type"]
        stepNumber = steps.index(stepSettings) + 1
        stepName = stepSettings["name"]

        # Get Current Network Positions
        position = stepSettings["tokenPosition"]
        oppositePosition = getOppositeDirection(position)

        # Get Token We Are Swapping From $ To
        toSwapFrom = stepSettings["from"]
        toSwapTo = stepSettings["to"]

        # Check If We Need To Top Up Wallet Before Starting Step
        recipe, toppedUpOccured = topUpWalletGas(
            recipe=recipe,
            topUpDirection=position,
            topUpTokenToUse=toSwapFrom
        )
        if toppedUpOccured:
            currentFunds["stablecoin"] = recipe[position]["wallet"]["balances"]["stablecoin"]
            currentFunds["token"] = recipe[position]["wallet"]["balances"]["token"]

        # Get Wallet Balances
        recipe = getWalletsInformation(recipe)

        if stepNumber <= 1:
            # On Step 1 - Print Out Our Starting Stables
            logger.info(f'Starting Capital: {currentFunds["stablecoin"]} {recipe[position]["stablecoin"]["name"]}')
            printSeperator(True)

        if toSwapTo != "done":

            # Print Out Current Step Info
            printSeperator()
            logger.info \
                    (
                    f'{stepNumber}. {stepCategory.title()} {truncateDecimal(currentFunds[toSwapFrom], 6)} '
                    f'{recipe[position][toSwapFrom]["name"]} -> {recipe[position][toSwapTo]["name"]}')

            # Update The Telegram Status Message
            telegramStatusMessage = appendToMessage(
                messageToAppendTo=recipe["status"]["telegramMessage"],
                messageToAppend=f"{stepNumber}. Doing {position.title()} {stepCategory.title()} -> 📤"
            )

            # Swap Step Actions
            if stepCategory == "swap":

                # First Get A Quote
                amountOutQuoted = getSwapQuoteOut(
                    recipe=recipe,
                    recipeDirection=position,
                    tokenType=toSwapFrom,
                    tokenIsGas=recipe[position][toSwapFrom]["isGas"],
                    tokenAmountIn=currentFunds[toSwapFrom]
                )

                # Calculate Min Out With Slippage
                amountOutMinWithSlippage = getValueWithSlippage(
                    amount=amountOutQuoted,
                    slippage=0.5
                )

                # Before We Swap Check If We Need To First Approve The Token To Be Spent
                recipe["status"]["telegramMessage"] = checkAndApproveToken(
                    recipe=recipe,
                    tokenPosition=position,
                    tokenType=toSwapFrom,
                    stepNumber=stepNumber,
                    tokenApprovalsSwap=True,
                    telegramStatusMessage=recipe["status"]["telegramMessage"]
                )

                # Get Wallet Balances Again In Case We Spent Tokens Approving
                recipe = getWalletsInformation(recipe)

                # Get Token Balance Before We Swap
                balanceBeforeSwap = recipe[position]["wallet"]["balances"][toSwapTo]

                swapResult = swapToken(
                    recipe=recipe,
                    recipeDirection=position,
                    tokenInAmount=currentFunds[toSwapFrom],
                    tokenOutAmount=amountOutMinWithSlippage,
                    tokenType=toSwapFrom,
                    stepCategory=stepCategory
                )

                recipe = getWalletsInformation(recipe)

                balanceAfterSwap = recipe[position]["wallet"]["balances"][toSwapTo]

                while balanceAfterSwap == balanceBeforeSwap:
                    recipe = getWalletsInformation(recipe)
                    balanceAfterSwap = recipe[position]["wallet"]["balances"][toSwapTo]

                result = balanceAfterSwap - balanceBeforeSwap

                currentFunds[toSwapTo] = result

                telegramStatusMessage = swapResult["telegramStatusMessage"]

            elif stepCategory == "bridge":

                if stepName == "destinationBridge":

                    quote = simulateStep(recipe=recipe, stepSettings=stepSettings, currentFunds=currentFunds)

                    if quote < startingStables:
                        telegramStatusMessage = appendToMessage(messageToAppendTo=telegramStatusMessage,
                                                                messageToAppend=f"Rolling Back Arbitrage #{recipe['status']['currentRoundTrip']} ‍⏮")

                        wasProfitable, telegramStatusMessage = rollbackArbitrage(recipe=recipe,
                                                                                 currentFunds=currentFunds,
                                                                                 startingStables=startingStables,
                                                                                 startingTime=startingTime,
                                                                                 telegramStatusMessage=recipe["status"][
                                                                                     "telegramMessage"])

                        return wasProfitable

                if not recipe[position][toSwapFrom]["isGas"]:
                    telegramStatusMessage = checkAndApproveToken(
                        recipe=recipe, tokenPosition=position, tokenType=toSwapFrom, stepNumber=stepNumber,
                        tokenApprovalsSwap=False, telegramStatusMessage=recipe["status"]["telegramMessage"]
                    )

                recipe = getWalletsInformation(recipe)

                balanceBeforeBridge = recipe[oppositePosition]["wallet"]["balances"][toSwapFrom]

                bridgeResult = executeBridge(
                    amountToBridge=currentFunds[toSwapFrom],
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
                    telegramStatusMessage=recipe["status"]["telegramMessage"],
                    predictions=predictions,
                    stepNumber=stepNumber
                )

                recipe = getWalletsInformation(recipe)
                balanceAfterBridge = recipe[oppositePosition]["wallet"]["balances"][toSwapFrom]

                while balanceAfterBridge == balanceBeforeBridge:
                    recipe = getWalletsInformation(recipe)
                    balanceAfterBridge = recipe[oppositePosition]["wallet"]["balances"][toSwapFrom]

                result = balanceAfterBridge - balanceBeforeBridge

                currentFunds[toSwapFrom] = result

                telegramStatusMessage = bridgeResult["telegramStatusMessage"]

            else:
                updateStatusMessage(originalMessage=telegramStatusMessage, newStatus="⛔️")
                errMsg = f'Invalid Arbitrage execution type: {stepCategory}'
                logger.error(errMsg)
                raise Exception(errMsg)

            recipe = getWalletsInformation(recipe)

            printSeperator()

            logger.info(f'Output: {truncateDecimal(result, 6)} {recipe[position][toSwapTo]["name"]}')
            telegramStatusMessage = updateStatusMessage(originalMessage=telegramStatusMessage, newStatus="✅")

            stepSettings["done"] = True

            printSeperator(True)

        else:

            wasProfitable = recipe[position]["wallet"]["balances"]["stablecoin"] > startingStables
            profitLoss = abs(recipe[position]["wallet"]["balances"]["stablecoin"] - startingStables)

            if wasProfitable:
                arbitragePercentage = percentageDifference(recipe[position]["wallet"]["balances"]["stablecoin"],
                                                           startingStables, 2)
            else:
                arbitragePercentage = percentageDifference(startingStables,
                                                           recipe[position]["wallet"]["balances"]["stablecoin"], 2)

            printArbitrageResult(count=recipe["status"]["currentRoundTrip"], amount=profitLoss,
                                 percentageDifference=arbitragePercentage, wasProfitable=wasProfitable,
                                 startingTime=startingTime, telegramStatusMessage=recipe["status"]["telegramMessage"])

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

        stepCategory = stepSettings["type"]
        stepNumber = steps.index(stepSettings) + 1 + normalStepCount

        position = stepSettings["tokenPosition"]
        oppositePosition = getOppositeDirection(position)
        toSwapFrom = stepSettings["from"]
        toSwapTo = stepSettings["to"]

        recipe, toppedUpOccured, telegramStatusMessage = topUpWalletGas(
            recipe=recipe,
            topUpDirection=position,
            topUpTokenToUse=toSwapFrom,
            telegramStatusMessage=recipe["status"]["telegramMessage"],
        )

        if toppedUpOccured:
            currentFunds["stablecoin"] = recipe[position]["wallet"]["balances"]["stablecoin"]
            currentFunds["token"] = recipe[position]["wallet"]["balances"]["token"]

        recipe = getWalletsInformation(recipe)

        recipe = getWalletsInformation(recipe)

        logger.info(
            f'{stepNumber}. {stepCategory.title()} {truncateDecimal(currentFunds[toSwapFrom], 6)} {recipe[position][toSwapFrom]["name"]} -> {recipe[position][toSwapTo]["name"]}')

        telegramStatusMessage = appendToMessage(messageToAppendTo=telegramStatusMessage,
                                                messageToAppend=f"{stepNumber}. RBack {position.title()} {stepCategory.title()} -> 📤")

        if stepCategory == "swap":

            balanceBeforeSwap = recipe[position]["wallet"]["balances"][toSwapTo]

            amountOutQuoted = getSwapQuoteOut(
                recipe=recipe,
                recipeDirection=position,
                tokenType=toSwapFrom,
                tokenIsGas=recipe[position][toSwapFrom]["isGas"],
                tokenAmountIn=currentFunds[toSwapFrom]
            )

            amountOutMinWithSlippage = getValueWithSlippage(amount=amountOutQuoted, slippage=0.5)

            telegramStatusMessage = checkAndApproveToken(
                recipe=recipe, tokenPosition=position, tokenType=toSwapFrom, stepNumber=stepNumber,
                tokenApprovalsSwap=True, telegramStatusMessage=recipe["status"]["telegramMessage"]
            )

            swapResult = swapToken(
                recipe=recipe,
                recipeDirection=position,
                tokenInAmount=currentFunds[toSwapFrom],
                tokenOutAmount=amountOutMinWithSlippage,
                tokenType=toSwapFrom,
                stepCategory=stepCategory
            )

            recipe = getWalletsInformation(recipe)

            balanceAfterSwap = recipe[position]["wallet"]["balances"][toSwapTo]

            while balanceAfterSwap == balanceBeforeSwap:
                recipe = getWalletsInformation(recipe)
                balanceAfterSwap = recipe[position]["wallet"]["balances"][toSwapTo]

            result = balanceAfterSwap - balanceBeforeSwap

            currentFunds[toSwapTo] = result

            telegramStatusMessage = swapResult["telegramStatusMessage"]

        elif stepCategory == "bridge":

            balanceBeforeBridge = recipe[oppositePosition]["wallet"]["balances"][toSwapFrom]

            telegramStatusMessage = checkAndApproveToken(
                recipe=recipe, tokenPosition=position, tokenType=toSwapFrom, stepNumber=stepNumber,
                tokenApprovalsSwap=False, telegramStatusMessage=recipe["status"]["telegramMessage"]
            )

            bridgeResult = executeBridge(
                amountToBridge=currentFunds[toSwapFrom],
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
                telegramStatusMessage=recipe["status"]["telegramMessage"],
                predictions=None,
                stepNumber=stepNumber
            )

            recipe = getWalletsInformation(recipe)
            balanceAfterBridge = recipe[oppositePosition]["wallet"]["balances"][toSwapFrom]

            while balanceAfterBridge == balanceBeforeBridge:
                recipe = getWalletsInformation(recipe)
                balanceAfterBridge = recipe[oppositePosition]["wallet"]["balances"][toSwapFrom]

            result = balanceAfterBridge - balanceBeforeBridge

            currentFunds[toSwapFrom] = result

            telegramStatusMessage = bridgeResult["telegramStatusMessage"]

        else:
            updateStatusMessage(originalMessage=telegramStatusMessage, newStatus="⛔️")
            errMsg = f'Invalid Arbitrage execution type: {stepCategory}'
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

    printArbitrageRollbackComplete(count=recipe["status"]["currentRoundTrip"], wasProfitable=wasProfitable,
                                   profitLoss=profitLoss, arbitragePercentage=arbitragePercentage,
                                   startingTime=startingTime, telegramStatusMessage=recipe["status"]["telegramMessage"])

    return wasProfitable, telegramStatusMessage
