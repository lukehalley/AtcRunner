import sys
import time

import helpers.Database as Database
import helpers.Logger as Log
import helpers.Arbitrage as Arbitrage
import helpers.Wallet as Wallet

# Init logger
logger = Log.setupLogging()

# Create connection to Firebase
Database.createDatabaseConnection()

# Get the arb recipes
recipes = Database.fetchFromDatabase("recipes")

# Get network information
networks = Database.fetchFromDatabase("networks")

# Get token information
tokens = Database.fetchFromDatabase("tokens")

# Calculate how often we can query dex tools
minimumInterval = Arbitrage.calculateQueryInterval(len(recipes))

print("------------------------------------------------------------------------------------------------------------------")

for recipesTitle, recipeDetails in recipes.items():

    chainOne = recipeDetails["chainOne"]
    chainTwo = recipeDetails["chainTwo"]

    while True:

        chainOne["tokenDexPair"] = tokens[recipeDetails["chainOne"]["chain"]][recipeDetails["chainOne"]["token"]]["dexPair"]
        chainOne["networkDetails"] = networks[recipeDetails["chainOne"]["chain"]]

        chainTwo["tokenDexPair"] = tokens[recipeDetails["chainTwo"]["chain"]][recipeDetails["chainTwo"]["token"]]["dexPair"]
        chainTwo["networkDetails"] = networks[recipeDetails["chainTwo"]["chain"]]

        reportString, priceDifference, arbitrageOrigin, arbitrageDestination = Arbitrage.calculateArbitrage(
            arbTitle=recipesTitle,
            chainOne=chainOne,
            chainTwo=chainTwo,
            )

        if (Arbitrage.checkArbitragIsWorthIt(priceDifference) and arbitrageOrigin and arbitrageDestination):

            logger.info(f"Arbitrage Opportunity Identified!")
            logger.info(reportString)

            originWalletAddress = Wallet.getWalletAddressFromPrivateKey(arbitrageOrigin["networkDetails"]["chainRPC"])
            destinationWalletAddress = Wallet.getWalletAddressFromPrivateKey(arbitrageDestination["networkDetails"]["chainRPC"])

            originWalletTokenBalance = Wallet.getTokenBalance(arbitrageOrigin["networkDetails"]["chainRPC"], originWalletAddress, arbitrageOrigin['token'], arbitrageOrigin['chain'])
            destinationWalletTokenBalance = Wallet.getTokenBalance(arbitrageDestination["networkDetails"]["chainRPC"], destinationWalletAddress, arbitrageDestination['token'], arbitrageDestination['chain'])

            time.sleep(10)
        else:
            time.sleep(minimumInterval)

        print("------------------------------------------------------------------------------------------------------------------")

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



