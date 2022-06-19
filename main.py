import time
from dotenv import load_dotenv
load_dotenv()

# Utility modules
from src.utils.general import checkIsDocker, printSeperator, printRoundtrip, printArbitrageProfitable, calculateQueryInterval
from src.utils.logger import setupLogging

# API modules
from src.api.firebase import createDatabaseConnection, writeTransactionToDB

# Data modules
from src.data.recipe import getRecipeDetails
from src.data.arbitrage import determineArbitrageStrategy, simulateArbitrage, executeArbitrage

# Wallet modules
from src.wallet.queries.network import getWalletsInformation

# General Init
isDocker = checkIsDocker()
logger = setupLogging(isDocker)

# Test Settings
useTestCapital = False
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

        recipe = originalRecipes.copy()

        recipe = determineArbitrageStrategy(recipe)

        printRoundtrip(recipe["arbitrage"]["currentRoundTripCount"])

        printSeperator()
        logger.info(f"[ARB #{recipe['arbitrage']['currentRoundTripCount']}] Getting Wallet Details & Balance")
        printSeperator()

        recipe = getWalletsInformation(recipe=recipe, printBalances=True)

        recipe["status"]["capital"] = recipe["origin"]["wallet"]["balances"]["stablecoin"]

        # TEST STUFF ####################################

        if useTestCapital:
            recipe["status"]["capital"] = startingCapitalTestAmount
            recipe["destination"]["wallet"]["balances"]["stablecoin"] = startingCapitalTestAmount
            recipe["origin"]["wallet"]["balances"]["stablecoin"] = startingCapitalTestAmount

        # TEST STUFF ####################################

        printSeperator(True)

        tripIsProfitible = simulateArbitrage(recipe)

        printSeperator(True)

        if tripIsProfitible or True:

            telegramStatusMessage = printArbitrageProfitable(recipe['arbitrage']['currentRoundTripCount'])

            startingTime = time.perf_counter()

            outcome = executeArbitrage(recipe, startingTime, telegramStatusMessage)

        else:
            printSeperator()
            logger.info(f'[ARB #{recipe["arbitrage"]["currentRoundTripCount"]}] Trip Not Profitable, waiting {minimumInterval} seconds')
            logger.info(f'Waiting {minimumInterval} seconds...')
            time.sleep(minimumInterval)
            printSeperator(True)