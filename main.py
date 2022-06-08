import time
from dotenv import load_dotenv
load_dotenv()

from helpers import Data, Database, Logger, Arbitrage, Wallet, Utils, Bridge

# General Init

isDocker = Utils.checkIsDocker()
logger = Logger.setupLogging(isDocker)
roundTripCount = 1

# Test Settings
useTestCapital = True
startingCapitalTestAmount = 150

# Firebase Setup
Utils.printSeperator()
logger.info(f"Getting Data From Firebase")
Utils.printSeperator()
Database.createDatabaseConnection()
recipes = Data.getRecipeDetails()

Utils.printSeperator(True)

# Interval Set-Up
minimumInterval = Arbitrage.calculateQueryInterval(len(recipes))

Utils.printSeperator()
logger.info(f"Waiting For Arbitrage Opportunity...")
Utils.printSeperator(True)

for recipesTitle, recipe in recipes.items():

    while True:

        recipe = Arbitrage.setUpArbitrage(recipe)

        logger.debug(f"[ARB #{roundTripCount}] Checking If Theres An Arbitrage Between The Pair")

        recipe["info"]["currentRoundTripCount"] = roundTripCount

        Utils.printRoundtrip(roundTripCount)

        Utils.printSeperator()
        logger.info(f"[ARB #{roundTripCount}] Arbitrage Opportunity Identified")
        Utils.printSeperator()
        logger.info(recipe["info"]["reportString"])
        if recipe["arbitrage"]["directionLockEnabled"]:
            logger.info(f"Direction lock enabled")
        Utils.printSeperator(True)

        Utils.printSeperator()
        logger.info(f"[ARB #{roundTripCount}] Getting Wallet Details & Balance")
        Utils.printSeperator()

        recipe = Wallet.getWalletsInformation(recipe)

        recipe["status"]["capital"] = recipe["origin"]["wallet"]["balances"]["stablecoin"]

        # TEST STUFF ####################################

        if useTestCapital:
            recipe["status"]["capital"] = startingCapitalTestAmount
            recipe["destination"]["wallet"]["balances"]["stablecoin"] = startingCapitalTestAmount
            recipe["origin"]["wallet"]["balances"]["stablecoin"] = startingCapitalTestAmount

        # TEST STUFF ####################################

        if not recipe["status"]["stablesAreOnOrigin"]:
            initialStablecoinMoveQuote = Bridge.estimateBridgeOutput(
                fromChain=recipe["destination"]["chain"]["id"],
                toChain=recipe["origin"]["chain"]["id"],
                fromToken=recipe["destination"]["stablecoin"]["symbol"],
                toToken=recipe["origin"]["stablecoin"]["symbol"],
                amountToBridge=recipe["status"]["capital"],
                decimalPlacesFrom=recipe["origin"]["stablecoin"]["decimals"],
                decimalPlacesTo=recipe["destination"]["stablecoin"]["decimals"]
            )
            recipe = Data.addFee(recipe, initialStablecoinMoveQuote["bridgeFee"], "setup")
        else:
            recipe = Data.addFee(recipe, 0, "setup")

        Utils.printSeperator(True)

        Utils.printSeperator()
        logger.info(f"[ARB #{roundTripCount}] Checking We Have Enough Gas Both Wallets")
        Utils.printSeperator()

        recipe = Wallet.topUpWalletGas(
            recipe=recipe,
            direction="origin",
            toSwapFrom="stablecoin"
        )

        Utils.printSeperator(True)

        recipe = Wallet.getSwapQuotes(recipe)

        recipe = Bridge.calculateSynapseBridgeFees(recipe)

        Utils.printSeperator(True)

        Utils.printSeperator(True)

        Utils.printSeperator()
        logger.info(f'[ARB #{roundTripCount}] Potential Profit Would Be')
        Utils.printSeperator()

        tripIsProfitible = Arbitrage.calculatePotentialProfit(
            recipe=recipe,
            trips="1"
        )

        Utils.printSeperator(True)

        if tripIsProfitible:

            Utils.printSeperator()
            logger.info(f'[ARB #{roundTripCount}] [Bridge (1/2)] [Executing] Origin -> Destination: {recipe["origin"]["chain"]["name"].title()} -> {recipe["destination"]["chain"]["name"].title()}')
            Utils.printSeperator()

            Bridge.executeBridge(
                amountToBridge=1,
                decimals=18,
                fromChain=53935,
                toChain=1666600000,
                fromToken='JEWEL',
                toToken='JEWEL',
                rpcURL='https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc'
            )

            # recipe = Bridge.executeBridge(
            #     amountToBridge=2,
            #     decimals=18,
            #     fromChain=53935,
            #     toChain=1666600000,
            #     fromToken='DFK_USDC',
            #     toToken='USDC',
            #     rpcURL='https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc'
            # )

            # recipe = Bridge.executeBridge(
            #     amountToBridge=recipe["status"]["capital"],
            #     fromChain=recipe["origin"]["chain"]["id"],
            #     toChain=recipe["destination"]["chain"]["id"],
            #     fromToken=recipe["origin"]["stablecoin"]["symbol"],
            #     toToken=recipe["destination"]["stablecoin"]["symbol"],
            #     rpcURL=recipe["origin"]["chain"]["rpc"]
            # )

            Utils.printSeperator(True)

            Utils.printSeperator()
            logger.info(
                f'[ARB #{roundTripCount}] [Bridge (1/2)] [Waiting] Origin -> Destination: {recipe["destination"]["chain"]["name"].title()} -> {recipe["origin"]["chain"]["name"].title()}')
            Utils.printSeperator()

            # Wallet.topUpWalletGas(
            #     recipe=recipe,
            #     direction="destination",
            #     toSwapFrom="token"
            # )

            # postOriginWalletTokenBalance, postDestinationWalletTokenBalance = Wallet.waitForBridgeToComplete(arbitragePlan)

            roundTripCount = roundTripCount + 1

            Utils.printSeperator(True)

            # arbitrageDestinationStableSwapTX = Wallet.swapToken(tokenToSwapFrom=destinationStablecoinName,
            #                                                     tokenToSwapTo=destinationToken, amountToSwap=10,
            #                                                     rpcURL=destinationRPCUrl,
            #                                                     chain=arbitrageDestination["chain"])

        else:
            time.sleep(minimumInterval)