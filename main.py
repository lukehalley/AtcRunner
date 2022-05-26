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

startingCapitalTestAmount = 1675
tokensToLeave = 5
minimumGasBalance = 1

for recipesTitle, recipe in recipes.items():

    while True:

        logger.debug(f"[ARB #{roundTripCount}] Checking If Theres An Arbitrage Between The Pair")

        recipe = Arbitrage.setUpArbitrage(recipe)

        recipe["arbitrage"]["currentRoundTripCount"] = roundTripCount

        if True:

            Utils.printRoundtrip(roundTripCount)

            Utils.printSeperator()
            logger.info(f"[ARB #{roundTripCount}] Arbitrage Opportunity Identified")
            Utils.printSeperator()
            logger.info(recipe["arbitrage"]["reportString"])
            Utils.printSeperator(True)

            Utils.printSeperator()
            logger.info(f"[ARB #{roundTripCount}] Getting Wallet Details & Balance")
            Utils.printSeperator()

            recipe = Wallet.getWalletsInformation(recipe)

            stablesAreOnOrigin = originWalletStablecoinBalance > destinationWalletStablecoinBalance

            initialStablecoinMoveQuote = Bridge.estimateBridgeOutput(
                arbitrageDestination["networkDetails"]["chainID"],
                arbitrageOrigin["networkDetails"]["chainID"],
                arbitrageDestination["stablecoin"],
                arbitrageOrigin["stablecoin"],
                originWalletStablecoinBalance
            )

            Utils.printSeperator(True)

            if originWalletStablecoinBalance > 0:
                startingCapital = originWalletStablecoinBalance
            else:
                logger.info(f"[TEST] Origin wallet stablecoin balance is {originWalletStablecoinBalance} - setting to {startingCapitalTestAmount}")
                startingCapital = startingCapitalTestAmount

            Utils.printSeperator()
            logger.info(f"[ARB #{roundTripCount}] Checking We Have Enough Gas Both Wallets")
            Utils.printSeperator()

            Wallet.checkWalletsGas(arbitrageOrigin, originWalletGasBalance, arbitrageDestination, destinationWalletGasBalance)


            Utils.printSeperator(True)

            arbitragePlan = Bridge.calculateSynapseBridgeFees(arbitrageOrigin, arbitrageDestination, amountToBridge)

            Utils.printSeperator(True)

            Utils.printSeperator()
            logger.info(f'[ARB #{roundTripCount}] Potential Profit Would Be')
            Utils.printSeperator()

            tripIsProfitible, tripPredictions = Arbitrage.calculatePotentialProfit(startingCapital, arbitrageOrigin,
                                                                                   arbitrageDestination,
                                                                                   arbitragePlan)

            arbitragePlan["arbitrageOrigin"]["walletAddress"] = originWalletAddress
            arbitragePlan["arbitrageDestination"]["walletAddress"] = destinationWalletAddress

            arbitragePlan["currentPotentialPL"] = int(tripPredictions["1"]["P/L"])
            arbitragePlan["tripPredictions"] = json.dumps(tripPredictions)

            Utils.printSeperator(True)

            Utils.printSeperator()
            logger.info(f'[ARB #{roundTripCount}] [Bridge (1/2)] [Executing] Origin -> Destination: {(arbitrageOrigin["readableChain"].title())} -> {(arbitrageDestination["readableChain"].title())}')
            Utils.printSeperator()

            arbitragePlan["currentBridgeDirection"] = "arbitrageOrigin"
            arbitragePlan["oppositeBridgeDirection"] = "arbitrageDestination"

            arbitragePlan = Bridge.executeBridge(arbitragePlan, amountToBridge)

            Utils.printSeperator(True)

            Utils.printSeperator()
            logger.info(f'[ARB #{roundTripCount}] [Bridge (1/2)] [Waiting] Origin -> Destination: {(arbitrageOrigin["readableChain"].title())} -> {(arbitrageDestination["readableChain"].title())}')
            Utils.printSeperator()

            postOriginWalletTokenBalance, postDestinationWalletTokenBalance = Wallet.waitForBridgeToComplete(arbitragePlan)

            roundTripCount = roundTripCount + 1

            Utils.printSeperator(True)

            arbitrageDestinationStableSwapTX = Wallet.swapToken(tokenToSwapFrom=destinationStablecoinName, tokenToSwapTo=destinationToken, amountToSwap=10, rpcURL=destinationRPCUrl, chain=arbitrageDestination["chain"])

        else:
            time.sleep(minimumInterval)