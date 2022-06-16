import time
from dotenv import load_dotenv
load_dotenv()

# Utility modules
from src.utils.general import checkIsDocker, printSeperator, printRoundtrip, printArbitrageProfitable, calculateQueryInterval
from src.utils.logger import setupLogging

# API modules
from src.api.firebase import createDatabaseConnection

# Data modules
from src.data.recipe import getRecipeDetails
from src.data.arbitrage import determineArbitrageStrategy, simulateArbitrage, executeArbitrage

# Wallet modules
from src.wallet.queries.network import getWalletsInformation
from src.wallet.actions.network import topUpWalletGas

# General Init
isDocker = checkIsDocker()
logger = setupLogging(isDocker)
roundTripCount = 1

# Test Settings
useTestCapital = True
startingCapitalTestAmount = 10

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

        printRoundtrip(roundTripCount)

        recipe = originalRecipes.copy()

        recipe["info"]["currentRoundTripCount"] = roundTripCount

        recipe = determineArbitrageStrategy(recipe)

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

        tripIsProfitible = simulateArbitrage(recipe)

        printSeperator(True)

        if tripIsProfitible or True:

            telegramMessage = printArbitrageProfitable(roundTripCount)

            startingTime = time.perf_counter()

            outcome = executeArbitrage(recipe, startingTime, telegramMessage)

            endTimer = time.perf_counter()

        else:
            printSeperator()
            logger.info(f'[ARB #{roundTripCount}] Trip Not Profitable, waiting {minimumInterval} seconds')
            logger.info(f'Waiting {minimumInterval} seconds...')
            time.sleep(minimumInterval)
            printSeperator(True)