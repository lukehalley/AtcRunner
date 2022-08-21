import sys

from src.apis.firebaseDB.firebaseDB_Querys import fetchStrategy
from src.apis.telegramBot.telegramBot_Action import appendToMessage, updateStatusMessage
from src.arbitrage.arbitrage_Simulate import simulateStep
from src.arbitrage.arbitrage_Utils import getOppositePosition
from src.chain.bridge.bridge_Actions import executeBridge
from src.chain.network.network_Actions import topUpWalletGas, checkAndApproveToken
from src.chain.network.network_Querys import getWalletsInformation
from src.chain.swap.swap_Querys import getSwapQuoteOut
from src.chain.swap.swap_Actions import swapToken, setupWallet
from src.utils.chain.chain_Calculations import getValueWithSlippage
from src.utils.logging.logging_Print import printSeparator, printArbitrageResult, printArbitrageRollbackComplete
from src.utils.logging.logging_Setup import getProjectLogger
from src.utils.math.math_Decimal import truncateDecimal
from src.utils.math.math_Percentage import percentageDifference

logger = getProjectLogger()

# Execute an Arbitrage
def executeArbitrage(recipe, isRollback):

    # Print Arb Info
    printSeparator()
    logger.info(
        f"[ARB #{recipe['status']['currentRoundTrip']}] "
        f"Executing Arbitrage"
    )
    printSeparator()

    if isRollback:
        # Fetch Our Rollback Strategy
        steps = fetchStrategy(
            recipe=recipe,
            strategyType="rollback"
        )

        recipe["status"]["telegramMessage"] = appendToMessage(
            messageToAppendTo=recipe["status"]["telegramMessage"],
            messageToAppend=f"Rolling Back Arbitrage #{recipe['status']['currentRoundTrip']} ‍⏮"
        )
    else:
        # Fetch Arbitrage Strategy
        steps = fetchStrategy(
            recipe=recipe,
            strategyType="arbitrage"
        )

    # Collect Initial Wallet Balances
    recipe = getWalletsInformation(
        recipe=recipe
    )

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
        position = stepSettings["recipePosition"]
        oppositePosition = getOppositePosition(position)

        # Get Token We Are Swapping From $ To
        fromToken = stepSettings["from"]
        toToken = stepSettings["to"]

        # Check If We Need To Top Up Wallet Before Starting Step
        recipe, toppedUpOccured = topUpWalletGas(
            recipe=recipe,
            topUpDirection=position,
            topUpTokenToUse=fromToken
        )
        if toppedUpOccured:
            currentFunds["stablecoin"] = recipe[position]["wallet"]["balances"]["stablecoin"]
            currentFunds["token"] = recipe[position]["wallet"]["balances"]["token"]

        # Get Wallet Balances
        recipe = getWalletsInformation(
            recipe=recipe
        )

        if stepNumber <= 1:
            # On Step 1 - Print Out Our Starting Stables
            logger.info(f'Starting Capital: {currentFunds["stablecoin"]} {recipe[position]["stablecoin"]["name"]}')
            printSeparator(True)

        if toToken != "done":

            # Print Out Current Step Info
            printSeparator()
            logger.info \
                    (
                    f'{stepNumber}. {stepCategory.title()} {truncateDecimal(currentFunds[fromToken], 6)} '
                    f'{recipe[position][fromToken]["name"]} -> {recipe[position][toToken]["name"]}')

            # Update The Telegram Status Message
            recipe["status"]["telegramMessage"] = appendToMessage(
                messageToAppendTo=recipe["status"]["telegramMessage"],
                messageToAppend=f"{stepNumber}. Doing {position.title()} {stepCategory.title()} -> 📤"
            )

            # Swap Step Actions
            if stepCategory == "swap":

                # First Get A Quote
                amountOutQuoted = getSwapQuoteOut(
                    recipe=recipe,
                    recipeDirection=position,
                    tokenType=fromToken,
                    tokenIsGas=recipe[position][fromToken]["isGas"],
                    tokenAmountIn=currentFunds[fromToken]
                )

                # Calculate Min Out With Slippage
                amountOutMinWithSlippage = getValueWithSlippage(
                    amount=amountOutQuoted,
                    slippage=0.5
                )

                # Before We Swap Check If We Need To First Approve The Token To Be Spent
                recipe = checkAndApproveToken(
                    recipe=recipe,
                    recipePosition=position,
                    tokenType=fromToken,
                    stepNumber=stepNumber,
                    approvalType=stepCategory
                )

                # Get Token Balance Before We Swap
                balanceBeforeSwap = recipe[position]["wallet"]["balances"][toToken]

                # Execute The Token Swap
                swapResult = swapToken(
                    recipe=recipe,
                    recipePosition=position,
                    tokenInAmount=currentFunds[fromToken],
                    tokenOutAmount=amountOutMinWithSlippage,
                    tokenType=fromToken,
                    stepCategory=stepCategory
                )

                # Get Wallet Balances Again In Case We Spent Tokens Approving
                recipe = getWalletsInformation(
                    recipe=recipe
                )

                # Get The Balance After Swap So We Know How Much Tokens We Gained
                balanceAfterSwap = recipe[position]["wallet"]["balances"][toToken]

                # Wait For The Tokens To Arrive In Out Wallet
                while balanceAfterSwap == balanceBeforeSwap:
                    recipe = getWalletsInformation(
                        recipe=recipe
                    )
                    balanceAfterSwap = recipe[position]["wallet"]["balances"][toToken]

                # Get The True Amount Of Tokens Gained From Swap
                result = balanceAfterSwap - balanceBeforeSwap

                # Set Out Current Funds
                currentFunds[toToken] = result

                # Update Our Stored Telegram Message
                telegramStatusMessage = swapResult["telegramStatusMessage"]

            # Bridge Step Actions
            elif stepCategory == "bridge":

                # If We Are At Our Bridge Which Will Return Home
                # Before We Finish Our Arbitrage, Check If
                # We Need To Rollback
                if stepName == "destinationBridge":

                    # Simulate Our Bridge Step
                    quote = simulateStep(
                        recipe=recipe,
                        stepSettings=stepSettings,
                        currentFunds=currentFunds
                    )

                    # Check If We Would Would Lose Money
                    if quote < startingStables:

                        # Rollback Arbitrage
                        executeArbitrage(
                            recipe=recipe,
                            isRollback=True
                        )

                # Check If We Are Swapping From Gas
                # If We Are We Don't Have To Approve It
                if not recipe[position][fromToken]["isGas"]:

                    # Check If The The Token We Are Swapping To Needs To Be Approved
                    # If So - Approve It
                    recipe = checkAndApproveToken(
                        recipe=recipe,
                        recipePosition=position,
                        tokenType=fromToken,
                        stepNumber=stepNumber,
                        approvalType=stepCategory
                    )

                    # Get Wallet Balances Again In Case We Spent Tokens Approving
                    recipe = getWalletsInformation(
                        recipe=recipe
                    )

                # Get Token Balance Before We Bridge
                balanceBeforeBridge = recipe[oppositePosition]["wallet"]["balances"][fromToken]

                # Execute The Bridge
                bridgeResult = executeBridge(
                    recipe=recipe,
                    recipePosition=position,
                    tokenAmountBridge=currentFunds[fromToken],
                    tokenType=fromToken,
                    stepCategory=stepCategory,
                    stepNumber=stepNumber
                )

                # Get Token Balance After We Bridge
                recipe = getWalletsInformation(
                    recipe=recipe
                )

                # Get The Balance After Bridge So We Know How Much Tokens We Gained
                balanceAfterBridge = recipe[oppositePosition]["wallet"]["balances"][fromToken]

                # Wait For Balance On Chain We Are Bridging On To Update
                while balanceAfterBridge == balanceBeforeBridge:
                    recipe = getWalletsInformation(
                        recipe=recipe
                    )
                    balanceAfterBridge = recipe[oppositePosition]["wallet"]["balances"][fromToken]

                # Calculate The True Amount Bridged + Update Our Balance
                result = balanceAfterBridge - balanceBeforeBridge
                currentFunds[fromToken] = result

                # Update Our Stored Telegram Message
                telegramStatusMessage = bridgeResult["telegramStatusMessage"]

            else:
                # If We Provide An Invalid Step Category - Exit w/ Error
                errMsg = f'Invalid Arbitrage Step Category: {stepCategory}'
                sys.exit(errMsg)

            # Update Telegram Message To Notify The Step Was Successfull
            printSeparator()
            logger.info(f'Output: {truncateDecimal(result, 6)} {recipe[position][toToken]["name"]}')
            recipe["telegramStatusMessage"] = updateStatusMessage(originalMessage=telegramStatusMessage, newStatus="✅")
            printSeparator(True)

            # Mark The Step As Done
            stepSettings["done"] = True

        else:

            # Check If Arbitrage Was Profitable
            wasProfitable = recipe[position]["wallet"]["balances"]["stablecoin"] > startingStables
            profitLoss = abs(recipe[position]["wallet"]["balances"]["stablecoin"] - startingStables)

            # Calculate The Percentage Gain/Loss Made In The Arbitrage
            if wasProfitable:
                arbitragePercentage = percentageDifference(recipe[position]["wallet"]["balances"]["stablecoin"],
                                                           startingStables, 2)
            else:
                arbitragePercentage = percentageDifference(startingStables,
                                                           recipe[position]["wallet"]["balances"]["stablecoin"], 2)

            # Print The Applicable Message To Notify The Arbitrage Result
            if isRollback:
                printArbitrageRollbackComplete(count=recipe["status"]["currentRoundTrip"], wasProfitable=wasProfitable,
                                               profitLoss=profitLoss, arbitragePercentage=arbitragePercentage,
                                               startingTime=recipe["status"]["startingTime"],
                                               telegramStatusMessage=recipe["status"]["telegramMessage"])
            else:
                printArbitrageResult(count=recipe["status"]["currentRoundTrip"], amount=profitLoss,
                                     percentageDifference=arbitragePercentage, wasProfitable=wasProfitable,
                                     startingTime=recipe["status"]["startingTime"], telegramStatusMessage=recipe["status"]["telegramMessage"])