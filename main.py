import sys
import time

import helpers.Database as Database
import helpers.Logger as Log
import helpers.Arbitrage as Arbitrage
import helpers.Wallet as Wallet

# Init logger
logger = Log.setupLogging()

# Create connection to Firebase
Database.createDatabaseConnection(logger)

# Get the arb recipes
recipes = Database.fetchFromDatabase(logger, "recipes")

# Get network information
networks = Database.fetchFromDatabase(logger, "networks")

# Calculate how often we can query dex tools
minimumInterval = Arbitrage.calculateQueryInterval(len(recipes))

for recipesTitle, recipeDetails in recipes.items():

    networkOneDetails = recipeDetails["networkOne"]
    networkTwoDetails = recipeDetails["networkTwo"]

    while True:

        reportString, priceDifference, arbitrageOrigin, arbitrageDestination, networkOnePrice, networkTwoPrice = Arbitrage.calculateArbitrage(
            arbTitle=recipesTitle,
            networkOne=networkOneDetails,
            networkTwo=networkTwoDetails,
            )

        if (Arbitrage.checkArbitragIsWorthIt(priceDifference) and arbitrageOrigin and arbitrageDestination):
            print("Worth it!")

            print(reportString)

            originNetwork = networks[arbitrageOrigin]
            destinationNetwork = networks[arbitrageDestination]

            originWalletAddress = Wallet.getWalletAddressFromPrivateKey(originNetwork['chainRPC'])
            destinationWalletAddress = Wallet.getWalletAddressFromPrivateKey(destinationNetwork['chainRPC'])

            if not originWalletAddress == destinationWalletAddress:
                sys.exit(f"Network wallets do not match!\nNW1: {originWalletAddress}\nNW2: {destinationWalletAddress}")

            originDetails = [v for v in recipeDetails.values() if arbitrageOrigin in v.values()]
            originToken = originDetails[0]["token"]

            originWalletTokenBalance = Wallet.getTokenBalance(originNetwork["chainRPC"], originWalletAddress, originToken)

            time.sleep(10)
        else:
            print("Not worth it!")
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



