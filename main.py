import time
from dotenv import load_dotenv
load_dotenv()

# Utility modules
from src.utils.general import checkIsDocker, printSeperator, printRoundtrip, calculateQueryInterval
from src.utils.logger import setupLogging

# API modules
from src.api.firebase import createDatabaseConnection

# Data modules
from src.data.recipe import getRecipeDetails
from src.data.arbitrage import determineArbitrageStrategy, calculatePotentialProfit
from src.data.fees import addFee

# Wallet modules for query and actions
from src.wallet.queries.network import getWalletsInformation
from src.wallet.queries.swap import calculateSwapOutputs
from src.wallet.queries.bridge import estimateBridgeOutput, calculateSynapseBridgeFees
from src.wallet.actions.network import topUpWalletGas
from src.wallet.actions.bridge import executeBridge

# General Init
isDocker = checkIsDocker()
logger = setupLogging(isDocker)
roundTripCount = 1

# Test Settings
useTestCapital = True
startingCapitalTestAmount = 100

# Firebase Setup
printSeperator()
logger.info(f"Getting Data From Firebase")
printSeperator()
createDatabaseConnection()
recipes = getRecipeDetails()

printSeperator(True)

# Interval Set-Up
minimumInterval = calculateQueryInterval(len(recipes))

printSeperator()
logger.info(f"Waiting For Arbitrage Opportunity...")
printSeperator(True)

while True:

    for recipesTitle, originalRecipes in recipes.items():

        recipe = originalRecipes.copy()

        recipe = determineArbitrageStrategy(recipe)

        logger.debug(f"[ARB #{roundTripCount}] Checking If Theres An Arbitrage Between The Pair")

        recipe["info"]["currentRoundTripCount"] = roundTripCount

        printRoundtrip(roundTripCount)

        printSeperator()
        logger.info(f"[ARB #{roundTripCount}] Arbitrage Opportunity Identified")
        printSeperator()
        logger.info(recipe["info"]["reportString"])
        if recipe["arbitrage"]["directionLockEnabled"]:
            logger.info(f"Direction lock enabled")
        printSeperator(True)

        printSeperator()
        logger.info(f"[ARB #{roundTripCount}] Getting Wallet Details & Balance")
        printSeperator()

        recipe = getWalletsInformation(recipe)

        recipe["status"]["capital"] = recipe["origin"]["wallet"]["balances"]["stablecoin"]

        # TEST STUFF ####################################

        if useTestCapital:
            recipe["status"]["capital"] = startingCapitalTestAmount
            recipe["destination"]["wallet"]["balances"]["stablecoin"] = startingCapitalTestAmount
            recipe["origin"]["wallet"]["balances"]["stablecoin"] = startingCapitalTestAmount

        # TEST STUFF ####################################

        if not recipe["status"]["stablesAreOnOrigin"]:
            initialStablecoinMoveQuote = estimateBridgeOutput(
                fromChain=recipe["destination"]["chain"]["id"],
                toChain=recipe["origin"]["chain"]["id"],
                fromToken=recipe["destination"]["stablecoin"]["symbol"],
                toToken=recipe["origin"]["stablecoin"]["symbol"],
                amountToBridge=recipe["status"]["capital"],
                decimalPlacesFrom=recipe["origin"]["stablecoin"]["decimals"],
                decimalPlacesTo=recipe["destination"]["stablecoin"]["decimals"]
            )
            recipe = addFee(recipe=recipe, fee=initialStablecoinMoveQuote["bridgeFee"], section="setup")
        else:
            recipe = addFee(recipe=recipe, fee=0, section="setup")

        printSeperator(True)

        printSeperator()
        logger.info(f"[ARB #{roundTripCount}] Checking We Have Enough Gas In Origin Wallet")
        printSeperator()

        recipe = topUpWalletGas(
            recipe=recipe,
            direction="origin",
            toSwapFrom="stablecoin"
        )

        printSeperator(True)

        recipe = calculateSwapOutputs(recipe)

        printSeperator(True)

        recipe = calculateSynapseBridgeFees(recipe)

        printSeperator(True)

        printSeperator()
        logger.info(f'[ARB #{roundTripCount}] Potential Profit Would Be')
        printSeperator()

        tripIsProfitible = calculatePotentialProfit(
            recipe=recipe,
            trips="1,2,5,10,25,50,100,1000"
        )

        printSeperator(True)

        if tripIsProfitible:

            printSeperator()
            logger.info(f'[ARB #{roundTripCount}] [Bridge (1/2)] [Executing] Origin -> Destination: {recipe["origin"]["chain"]["name"].title()} -> {recipe["destination"]["chain"]["name"].title()}')
            printSeperator()

            executeBridge(
                amountToBridge=1,
                decimals=18,
                fromChain=53935,
                toChain=1666600000,
                fromToken='JEWEL',
                toToken='JEWEL',
                rpcURL='https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc'
            )

            # recipe = executeBridge(
            #     amountToBridge=2,
            #     decimals=18,
            #     fromChain=53935,
            #     toChain=1666600000,
            #     fromToken='DFK_USDC',
            #     toToken='USDC',
            #     rpcURL='https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc'
            # )

            # recipe = executeBridge(
            #     amountToBridge=recipe["status"]["capital"],
            #     fromChain=recipe["origin"]["chain"]["id"],
            #     toChain=recipe["destination"]["chain"]["id"],
            #     fromToken=recipe["origin"]["stablecoin"]["symbol"],
            #     toToken=recipe["destination"]["stablecoin"]["symbol"],
            #     rpcURL=recipe["origin"]["chain"]["rpc"]
            # )

            printSeperator(True)

            printSeperator()
            logger.info(f'[ARB #{roundTripCount}] [Bridge (1/2)] [Waiting] Origin -> Destination: {recipe["destination"]["chain"]["name"].title()} -> {recipe["origin"]["chain"]["name"].title()}')
            printSeperator()

            # topUpWalletGas(
            #     recipe=recipe,
            #     direction="destination",
            #     toSwapFrom="token"
            # )

            # postOriginWalletTokenBalance, postDestinationWalletTokenBalance = waitForBridgeToComplete(arbitragePlan)

            roundTripCount = roundTripCount + 1

            printSeperator(True)

            # arbitrageDestinationStableSwapTX = swapToken(tokenToSwapFrom=destinationStablecoinName,
            #                                                     tokenToSwapTo=destinationToken, amountToSwap=10,
            #                                                     rpcURL=destinationRPCUrl,
            #                                                     chain=arbitrageDestination["chain"])

        else:
            printSeperator()
            logger.info(f'[ARB #{roundTripCount}] Trip predicted not profitable, waiting {minimumInterval} seconds')
            time.sleep(minimumInterval)
            printSeperator(True)