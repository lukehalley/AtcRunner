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
from src.utils.logging.logging_Print import printSeparator, printArbitrageResult, printArbitrageComplete
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

    # Collect Initial Wallet Balances
    recipe = getWalletsInformation(
        recipe=recipe
    )

    if isRollback:

        # Fetch Our Rollback Strategy
        steps = fetchStrategy(
            recipe=recipe,
            strategyType="rollback"
        )

        recipe["status"]["telegramStatusMessage"] = appendToMessage(
            messageToAppendTo=recipe["status"]["telegramStatusMessage"],
            messageToAppend=f"Rolling Back Arbitrage #{recipe['status']['currentRoundTrip']} ‍⏮"
        )

        startingTokens = recipe["destination"]["wallet"]["balances"]["token"]

        # Used To Track Arb Balance
        currentFunds = {
            "stablecoin": 0,
            "token": startingTokens
        }

    else:

        # Fetch Arbitrage Strategy
        steps = fetchStrategy(
            recipe=recipe,
            strategyType="arbitrage"
        )

        recipe["status"]["startingStables"] = recipe["origin"]["wallet"]["balances"]["stablecoin"]

        # Used To Track Arb Balance
        currentFunds = {
            "stablecoin": recipe["status"]["startingStables"],
            "token": 0
        }

    # Iterate Through Arb Sets
    for stepSettings in steps:

        # Get Current Step Metadata
        stepCategory = stepSettings["type"]
        stepNumber = steps.index(stepSettings) + 1
        stepName = stepSettings["name"]

        # Get Current Network Positions
        recipePosition = stepSettings["position"]
        oppositePosition = getOppositePosition(recipePosition)

        # Get Token We Are Swapping From To Gas Tokens
        fromToken = stepSettings["from"]
        toToken = stepSettings["to"]

        # Check If We Need To Top Up Wallet Before Starting Step
        recipe, toppedUpOccured = topUpWalletGas(
            recipe=recipe,
            topUpDirection=recipePosition,
            topUpTokenToUse=fromToken
        )

        if toppedUpOccured:
            currentFunds["stablecoin"] = recipe[recipePosition]["wallet"]["balances"]["stablecoin"]
            currentFunds["token"] = recipe[recipePosition]["wallet"]["balances"]["token"]

        # Get Wallet Balances
        recipe = getWalletsInformation(
            recipe=recipe
        )

        if stepNumber <= 1:
            # On Step 1 - Print Out Our Starting Stables
            logger.info(f'Starting Capital: {currentFunds["stablecoin"]} {recipe[recipePosition]["stablecoin"]["name"]}')
            printSeparator(newLine=True)

        if toToken != "done":

            # Print Out Current Step Info
            printSeparator()
            logger.info \
                    (
                    f'{stepNumber}. {stepCategory.title()} {truncateDecimal(currentFunds[fromToken], 6)} '
                    f'{recipe[recipePosition][fromToken]["name"]} -> {recipe[recipePosition][toToken]["name"]}')

            # Update The Telegram Status Message
            recipe["status"]["telegramStatusMessage"] = appendToMessage(
                messageToAppendTo=recipe["status"]["telegramStatusMessage"],
                messageToAppend=f"{stepNumber}. Doing {recipePosition.title()} {stepCategory.title()} -> 📤"
            )

            # Swap Step Actions
            if stepCategory == "swap":

                # First Get A Quote
                amountOutQuoted = getSwapQuoteOut(
                    recipe=recipe,
                    recipePosition=recipePosition,
                    tokenType=fromToken,
                    tokenIsGas=recipe[recipePosition][fromToken]["isGas"],
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
                    recipePosition=recipePosition,
                    tokenType=fromToken,
                    stepNumber=stepNumber,
                    approvalType=stepCategory
                )

                # Get Token Balance Before We Swap
                balanceBeforeSwap = recipe[recipePosition]["wallet"]["balances"][toToken]

                # Execute The Token Swap
                recipe = swapToken(
                    recipe=recipe,
                    recipePosition=recipePosition,
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
                balanceAfterSwap = recipe[recipePosition]["wallet"]["balances"][toToken]

                # Wait For The Tokens To Arrive In Out Wallet
                while balanceAfterSwap == balanceBeforeSwap:
                    recipe = getWalletsInformation(
                        recipe=recipe
                    )
                    balanceAfterSwap = recipe[recipePosition]["wallet"]["balances"][toToken]

                # Get The True Amount Of Tokens Gained From Swap
                result = balanceAfterSwap - balanceBeforeSwap

                # Set Out Current Funds
                currentFunds[toToken] = result

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
                    if quote < recipe["status"]["startingStables"]:
                        # Rollback Arbitrage
                        executeArbitrage(
                            recipe=recipe,
                            isRollback=True
                        )

                # Check If We Are Swapping From Gas
                # If We Are We Don't Have To Approve It
                if not recipe[recipePosition][fromToken]["isGas"]:
                    # Check If The The Token We Are Swapping To Needs To Be Approved
                    # If So - Approve It
                    recipe = checkAndApproveToken(
                        recipe=recipe,
                        recipePosition=recipePosition,
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
                recipe = executeBridge(
                    recipe=recipe,
                    recipePosition=recipePosition,
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

            else:
                # If We Provide An Invalid Step Category - Exit w/ Error
                errMsg = f'Invalid Arbitrage Step Category: {stepCategory}'
                sys.exit(errMsg)

            # Update Telegram Message To Notify The Step Was Successfull
            printSeparator()
            logger.info(f'Output: {truncateDecimal(result, 6)} {recipe[recipePosition][toToken]["name"]}')
            recipe["telegramStatusMessage"] = updateStatusMessage(originalMessage=recipe["telegramStatusMessage"],
                                                                  newStatus="✅")
            printSeparator(newLine=True)

            # Mark The Step As Done
            stepSettings["done"] = True

        else:

            # Check If Arbitrage Was Profitable
            wasProfitable = recipe[recipePosition]["wallet"]["balances"]["stablecoin"] > recipe["status"]["startingStables"]
            profitLoss = abs(recipe[recipePosition]["wallet"]["balances"]["stablecoin"] - recipe["status"]["startingStables"])

            # Calculate The Percentage Gain/Loss Made In The Arbitrage
            if wasProfitable:
                arbitragePercentage = percentageDifference(recipe[recipePosition]["wallet"]["balances"]["stablecoin"],
                                                           recipe["status"]["startingStables"], 2)
            else:
                arbitragePercentage = percentageDifference(recipe["status"]["startingStables"],
                                                           recipe[recipePosition]["wallet"]["balances"]["stablecoin"], 2)

            # Print The Applicable Message To Notify The Arbitrage Result
            printArbitrageComplete(
                recipe=recipe,
                wasProfitable=wasProfitable,
                profitLoss=profitLoss,
                profitPercentage=arbitragePercentage,
                wasRollback=isRollback
            )

