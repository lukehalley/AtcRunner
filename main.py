import time, os
from dotenv import load_dotenv
load_dotenv()

# Utility modules
from src.utils.general import checkIsDocker, printSeperator, printRoundtrip, printArbitrageProfitable, calculateQueryInterval
from src.utils.logger import setupLogging

# Selenium modules
from src.web.actions import initBrowser

# API modules
from src.api.firebase import createDatabaseConnection

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
startingCapitalTestAmount = 5

# Firebase Setup
printSeperator()
logger.info(f"Getting Data From Firebase")
printSeperator()
createDatabaseConnection()
recipes = getRecipeDetails()

printSeperator(True)

# Interval Set-Up
minimumInterval = int(os.environ.get("ARBITRAGE_INTERVAL"))

printSeperator()
logger.info(f"Waiting For Arbitrage Opportunity...")
printSeperator(True)

originDriver = initBrowser(profileToUse=1)
destinationDriver = initBrowser(profileToUse=2)

while True:

    for recipesTitle, originalRecipes in recipes.items():

        recipe = originalRecipes.copy()

        recipe = determineArbitrageStrategy(recipe)

        printRoundtrip(recipe["arbitrage"]["currentRoundTripCount"])

        printSeperator()
        logger.info(f"[ARB #{recipe['arbitrage']['currentRoundTripCount']}] Getting Wallet Details & Balance")
        printSeperator()

        recipe = getWalletsInformation(recipe=recipe, printBalances=True)

        # TEST STUFF ####################################

        if useTestCapital:
            recipe["destination"]["wallet"]["balances"]["stablecoin"] = startingCapitalTestAmount
            recipe["origin"]["wallet"]["balances"]["stablecoin"] = startingCapitalTestAmount

        # TEST STUFF ####################################

        printSeperator(True)

        tripIsProfitible = simulateArbitrage(recipe, originDriver=originDriver, destinationDriver=destinationDriver)

        printSeperator(True)

        if tripIsProfitible and False:

            telegramStatusMessage = printArbitrageProfitable(recipe['arbitrage']['currentRoundTripCount'])

            startingTime = time.perf_counter()

            outcome = executeArbitrage(recipe, startingTime, telegramStatusMessage)

        else:
            printSeperator()
            logger.info(f'[ARB #{recipe["arbitrage"]["currentRoundTripCount"]}] Trip Not Profitable, waiting {minimumInterval} seconds')
            logger.info(f'Waiting {minimumInterval} seconds...')
            time.sleep(0)
            printSeperator(True)