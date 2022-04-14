import sys
import time

import helpers.Database as Database
import helpers.Logger as Log
import helpers.Arbitrage as Arbitrage
import helpers.Wallet as Wallet
import helpers.Selenium as Selenium
import helpers.Utils as Utils

isDocker = Utils.checkIsDocker()

# Init logger
logger = Log.setupLogging(isDocker)

roundTripCount = 1

Utils.printSeperator()
logger.info(f"Getting Data From Firebase")
Utils.printSeperator()

# Create connection to Firebase
Database.createDatabaseConnection()

# Get the arb data
recipes = Database.fetchFromDatabase("recipes")
networks = Database.fetchFromDatabase("networks")
tokens = Database.fetchFromDatabase("tokens")

Utils.printSeperator(True)

# Calculate how often we can query dex tools
minimumInterval = Arbitrage.calculateQueryInterval(len(recipes))

Utils.printSeperator()
logger.info(f"Waiting For Arbitrage Opportunity...")
Utils.printSeperator(True)

for recipesTitle, recipeDetails in recipes.items():

    chainOne = recipeDetails["chainOne"]
    chainTwo = recipeDetails["chainTwo"]

    while True:

        chainOne["tokenDexPair"] = tokens[recipeDetails["chainOne"]["chain"]][recipeDetails["chainOne"]["token"]]["dexPair"]
        chainOne["networkDetails"] = networks[recipeDetails["chainOne"]["chain"]]

        chainTwo["tokenDexPair"] = tokens[recipeDetails["chainTwo"]["chain"]][recipeDetails["chainTwo"]["token"]]["dexPair"]
        chainTwo["networkDetails"] = networks[recipeDetails["chainTwo"]["chain"]]

        logger.debug(f"[ARB #{roundTripCount}] Checking If Theres An Arbitrage Between The Pair")

        reportString, priceDifference, arbitrageOrigin, arbitrageDestination = Arbitrage.calculateArbitrage(
            arbTitle=recipesTitle,
            chainOne=chainOne,
            chainTwo=chainTwo,
            )

        arbIsWorthIt = Arbitrage.checkArbitrageIsWorthIt(priceDifference) and arbitrageOrigin and arbitrageDestination

        if (arbIsWorthIt):

            Utils.printRoundtrip(roundTripCount)

            Utils.printSeperator()
            logger.info(f"[ARB #{roundTripCount}] Arbitrage Opportunity Identified")
            Utils.printSeperator()
            logger.info(reportString)
            Utils.printSeperator(True)

            Utils.printSeperator()
            logger.info(f"[ARB #{roundTripCount}] Getting Wallet Details & Balance")
            Utils.printSeperator()

            originWalletAddress = Wallet.getWalletAddressFromPrivateKey(arbitrageOrigin["networkDetails"]["chainRPC"])
            destinationWalletAddress = Wallet.getWalletAddressFromPrivateKey(arbitrageDestination["networkDetails"]["chainRPC"])
            originWalletTokenBalance = Wallet.getTokenBalance(arbitrageOrigin["networkDetails"]["chainRPC"], originWalletAddress, arbitrageOrigin['token'], arbitrageOrigin['chain'])
            destinationWalletTokenBalance = Wallet.getTokenBalance(arbitrageDestination["networkDetails"]["chainRPC"], destinationWalletAddress, arbitrageDestination['token'], arbitrageDestination['chain'])

            Utils.printSeperator(True)

            Utils.printSeperator()
            logger.info(f"[ARB #{roundTripCount}] Launching Chrome & Metamask")
            Utils.printSeperator()

            driver, display = Selenium.initBrowser()
            Selenium.loginIntoMetamask(driver)
            Selenium.switchMetamaskNetwork(driver, arbitrageOrigin['chain'])
            Utils.printSeperator(True)

            Utils.printSeperator()
            logger.info(f'[ARB #{roundTripCount}] Bridging: {(arbitrageOrigin["readableChain"].title())} -> {(arbitrageDestination["readableChain"].title())}')
            Utils.printSeperator()
            Selenium.executeSynapseBridge(driver, arbitrageOrigin['bridgeToken'], arbitrageDestination['bridgeToken'], arbitrageDestination["networkDetails"]["chainID"], "10")
            Utils.printSeperator(True)

            Utils.printSeperator()
            logger.info(f"[ARB #{roundTripCount}] Finished - Running Cleanup")
            Utils.printSeperator()
            Selenium.closeBrowser(driver, display)
            Utils.printSeperator(True)

            roundTripCount = roundTripCount + 1

            time.sleep(10)
        else:

            time.sleep(minimumInterval)

# Iterate through the recipes

# Check if the current recipe has an arb.

# If it does have an arb check what the profit would be
# accounting for all fees.

# If its worth it check if we have have enough tokens in our wallet
# to make it worth it.

# Record the trade.

# If we need to swap to the starting token - do it.

# Before we bridge, make an arb checkpoint.

# Bridge over from the origin chain to the destination chain.

# Once we make it over, make an arb checkpoint.

# If the arb is still worth it and it will make a profit - make the swap.

# Record the trade.

# Bridge back to the origin chain from the destination chain.

# Swap it back to origin token and take note of profits.

# Check if arbitrage exists, if does go back for more.



