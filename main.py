import json
import sys
import time

import helpers.Database as Database
import helpers.Logger as Log
import helpers.Arbitrage as Arbitrage
import helpers.Wallet as Wallet
import helpers.Utils as Utils
import helpers.Bridge as Bridge

from helpers import Data

isDocker = Utils.checkIsDocker()

# Init logger
logger = Log.setupLogging(isDocker)

roundTripCount = 1

Utils.printSeperator()
logger.info(f"Getting Data From Firebase")
Utils.printSeperator()

# Create connection to Firebase
Database.createDatabaseConnection()

recipes = Data.getRecipeDetails()

Utils.printSeperator(True)

# Calculate how often we can query dex tools
minimumInterval = Arbitrage.calculateQueryInterval(len(recipes))

Utils.printSeperator()
logger.info(f"Waiting For Arbitrage Opportunity...")
Utils.printSeperator(True)

startingCapitalTestAmount = 100
tokensToLeave = 5
minimumGasBalance = 1

for recipesTitle, recipe in recipes.items():

    while True:

        logger.debug(f"[ARB #{roundTripCount}] Checking If Theres An Arbitrage Between The Pair")

        recipe = Arbitrage.setUpArbitrage(recipe)

        recipe["info"]["currentRoundTripCount"] = roundTripCount

        if True:

            Utils.printRoundtrip(roundTripCount)

            Utils.printSeperator()
            logger.info(f"[ARB #{roundTripCount}] Arbitrage Opportunity Identified")
            Utils.printSeperator()
            logger.info(recipe["info"]["reportString"])
            Utils.printSeperator(True)

            Utils.printSeperator()
            logger.info(f"[ARB #{roundTripCount}] Getting Wallet Details & Balance")
            Utils.printSeperator()

            recipe = Wallet.getWalletsInformation(recipe)

            # if recipe["origin"]["wallet"]["balances"]["stablecoin"] > 0:
            #     recipe["status"]["startingCapital"] = recipe["origin"]["wallet"]["balances"]["stablecoin"]
            # else:
            #     logger.info(f'[TEST] Origin wallet stablecoin balance is {recipe["origin"]["wallet"]["balances"]["stablecoin"]} - setting to {startingCapitalTestAmount}')
            #     recipe["status"]["startingCapital"] = recipe["destination"]["wallet"]["balances"]["stablecoin"]

            recipe["status"]["capital"] = startingCapitalTestAmount

            if not recipe["status"]["stablesAreOnOrigin"]:
                initialStablecoinMoveQuote = Bridge.estimateBridgeOutput(
                    fromChain=recipe["destination"]["chain"]["id"],
                    toChain=recipe["origin"]["chain"]["id"],
                    fromToken=recipe["destination"]["stablecoin"]["symbol"],
                    toToken=recipe["origin"]["stablecoin"]["symbol"],
                    amountToBridge=recipe["status"]["capital"],
                    decimalPlacesFrom=recipe["origin"]["stablecoin"]["tokenDecimals"],
                    decimalPlacesTo=recipe["destination"]["stablecoin"]["tokenDecimals"]
                )
                recipe = Data.addFee(recipe, initialStablecoinMoveQuote["bridgeFee"], "setup")
            else:
                recipe = Data.addFee(recipe, 0, "setup")


            Utils.printSeperator(True)

            Utils.printSeperator()
            logger.info(f"[ARB #{roundTripCount}] Checking We Have Enough Gas Both Wallets")
            Utils.printSeperator()

            # Wallet.checkWalletsGas(recipe)

            Utils.printSeperator(True)

            arbitragePlan = Bridge.calculateSynapseBridgeFees(recipe)

            Utils.printSeperator(True)

            Utils.printSeperator()
            logger.info(f'[ARB #{roundTripCount}] Potential Profit Would Be')
            Utils.printSeperator()

            Arbitrage.calculatePotentialProfit(recipe)

            Utils.printSeperator(True)

            Utils.printSeperator()
            logger.info(f'[ARB #{roundTripCount}] [Bridge (1/2)] [Executing] Origin -> Destination: {recipe["origin"]["chain"]["name"].title()} -> {recipe["destination"]["chain"]["name"].title()}')
            Utils.printSeperator()

            recipe = Bridge.executeBridge(
                amountToBridge=1,
                tokenDecimals=18,
                fromChain=53935,
                toChain=1666600000,
                fromToken='JEWEL',
                toToken='JEWEL',
                rpcURL='https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc'
            )

            # recipe = Bridge.executeBridge(
            #     amountToBridge=2,
            #     tokenDecimals=18,
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
            logger.info(f'[ARB #{roundTripCount}] [Bridge (1/2)] [Waiting] Origin -> Destination: {recipe["destination"]["chain"]["name"].title()} -> {recipe["origin"]["chain"]["name"].title()}')
            Utils.printSeperator()

            postOriginWalletTokenBalance, postDestinationWalletTokenBalance = Wallet.waitForBridgeToComplete(arbitragePlan)

            roundTripCount = roundTripCount + 1

            Utils.printSeperator(True)

            arbitrageDestinationStableSwapTX = Wallet.swapToken(tokenToSwapFrom=destinationStablecoinName, tokenToSwapTo=destinationToken, amountToSwap=10, rpcURL=destinationRPCUrl, chain=arbitrageDestination["chain"])

        else:
            time.sleep(minimumInterval)