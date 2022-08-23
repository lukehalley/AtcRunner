import sys

from src.apis.firebaseDB.firebaseDB_Querys import fetchStrategy
from src.apis.telegramBot.telegramBot_Action import appendToMessage, updateStatusMessage, removeStatusMessage
from src.arbitrage.arbitrage_Simulate import simulateStep
from src.arbitrage.arbitrage_Utils import getOppositePosition
from src.chain.bridge.bridge_Actions import executeBridge
from src.chain.network.network_Querys import getWalletsInformation
from src.chain.swap.swap_Actions import swapToken
from src.utils.logging.logging_Print import printSeparator, printArbitrageComplete
from src.utils.logging.logging_Setup import getProjectLogger
from src.utils.math.math_Decimal import truncateDecimal
from src.utils.math.math_Percentage import percentageDifference

logger = getProjectLogger()

# Execute an Arbitrage
def executeArbitrage(recipe, isRollback):

    # Collect Initial Wallet Balances
    recipe = getWalletsInformation(
        recipe=recipe
    )

    printSeparator()
    if isRollback:

        logger.info("\n")

        # Print Arb Info
        logger.info(
            f"[ARB #{recipe['status']['currentRoundTrip']}] "
            f"Executing Rollback"
        )

        # Fetch Our Rollback Strategy
        steps = fetchStrategy(
            recipe=recipe,
            strategyType="rollback"
        )

        recipe["status"]["telegramStatusMessage"] = removeStatusMessage(
            originalMessage=recipe["status"]["telegramStatusMessage"]
        )

        recipe["status"]["telegramStatusMessage"] = appendToMessage(
            messageToAppendTo=recipe["status"]["telegramStatusMessage"],
            messageToAppend=
                f"\n"
                f"[ Rollback ⏮ ]"
        )

    else:

        # Print Arb Info
        logger.info(
            f"[ARB #{recipe['status']['currentRoundTrip']}] "
            f"Executing Arbitrage"
        )

        # Fetch Arbitrage Strategy
        steps = fetchStrategy(
            recipe=recipe,
            strategyType="arbitrage"
        )

        recipe["status"]["startingStables"] = recipe["origin"]["wallet"]["balances"]["stablecoin"]

    printSeparator()

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
        # recipe, toppedUpOccured = topUpWalletGas(
        #     recipe=recipe,
        #     topUpDirection=recipePosition,
        #     topUpTokenToUse=fromToken
        # )

        # Get Wallet Balances
        recipe = getWalletsInformation(
            recipe=recipe
        )

        if stepNumber <= 1:
            # On Step 1 - Print Out Our Starting Stables

            logger.info(
                f'Starting Capital: {truncateDecimal(recipe[recipePosition]["wallet"]["balances"]["stablecoin"], 6)} '
                f'{recipe[recipePosition]["stablecoin"]["name"]}'
            )
            printSeparator(newLine=True)

        if toToken != "done":

            # Print Out Current Step Info
            printSeparator()
            logger.info \
                    (
                    f'{stepNumber}. {stepCategory.title()} {truncateDecimal(recipe[recipePosition]["wallet"]["balances"][fromToken], 6)} '
                    f'{recipe[recipePosition][fromToken]["name"]} -> '
                    f'{truncateDecimal(recipe["arbitrage"]["predictions"]["steps"][stepNumber]["amountOut"], 6)} {recipe[recipePosition][toToken]["name"]}')

            # Update The Telegram Status Message
            recipe["status"]["telegramStatusMessage"] = appendToMessage(
                messageToAppendTo=recipe["status"]["telegramStatusMessage"],
                messageToAppend=f"- {stepNumber}. {recipePosition.title()} {stepCategory.title()} -> 📤"
            )

            # Swap Step Actions
            if stepCategory == "swap":

                # Execute The Token Swap
                recipe = swapToken(
                    recipe=recipe,
                    recipePosition=recipePosition,
                    tokenType=fromToken,
                    stepCategory=stepCategory,
                    stepNumber=stepNumber
                )

                printSeparator()
                logger.info(
                    f'Output: {truncateDecimal(recipe[recipePosition]["wallet"]["balances"][toToken], 6)}'
                    f'{recipe[recipePosition][toToken]["name"]}'
                )

            # Bridge Step Actions
            elif stepCategory == "bridge":

                # If We Are At Our Bridge Which Will Return Home
                # Before We Finish Our Arbitrage, Check If
                # We Need To Rollback
                if stepName == "destinationBridge":

                    currentFunds = {
                        "stablecoin": recipe[recipePosition]["wallet"]["balances"]["stablecoin"],
                        "token": recipe[recipePosition]["wallet"]["balances"]["token"]
                    }

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

                        return

                # Execute The Bridge
                recipe = executeBridge(
                    recipe=recipe,
                    recipePosition=recipePosition,
                    tokenType=fromToken,
                    stepCategory=stepCategory,
                    stepNumber=stepNumber
                )

                printSeparator()
                logger.info(
                    f'Output: {truncateDecimal(recipe[oppositePosition]["wallet"]["balances"][toToken], 6)} '
                    f'{recipe[oppositePosition][toToken]["name"]}'
                )

            else:
                # If We Provide An Invalid Step Category - Exit w/ Error
                errMsg = f'Invalid Arbitrage Step Category: {stepCategory}'
                sys.exit(errMsg)

            # Update Telegram Message To Notify The Step Was Successfull
            recipe["status"]["telegramStatusMessage"] = updateStatusMessage(
                originalMessage=recipe["status"]["telegramStatusMessage"],
                newStatus="✅"
            )
            printSeparator(newLine=True)

            # Mark The Step As Done
            stepSettings["done"] = True

    # Check If Arbitrage Was Profitable
    wasProfitable = recipe["origin"]["wallet"]["balances"]["stablecoin"] > recipe["status"]["startingStables"]
    profitLoss = abs(recipe["origin"]["wallet"]["balances"]["stablecoin"] - recipe["status"]["startingStables"])

    # Calculate The Percentage Gain/Loss Made In The Arbitrage
    if wasProfitable:
        arbitragePercentage = percentageDifference(recipe["origin"]["wallet"]["balances"]["stablecoin"],
                                                   recipe["status"]["startingStables"], 2)
    else:
        arbitragePercentage = percentageDifference(recipe["status"]["startingStables"],
                                                   recipe["origin"]["wallet"]["balances"]["stablecoin"], 2)

    # Print The Applicable Message To Notify The Arbitrage Result
    printArbitrageComplete(
        recipe=recipe,
        wasProfitable=wasProfitable,
        profitLoss=profitLoss,
        profitPercentage=arbitragePercentage,
        wasRollback=isRollback
    )

    return
