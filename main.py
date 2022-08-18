import os, time
from dotenv import load_dotenv

load_dotenv()

from src.apis.firebaseDB.firebaseDB_Utils import createDatabaseConnection

from src.arbitrage.arbitrage_Calculate import calculateArbitrageIsProfitable, determineArbitrageStrategy
from src.arbitrage.arbitrage_Execute import executeArbitrage

from src.chain.network.network_Querys import getWalletsInformation
from src.chain.swap.swap_Actions import setupWallet

from src.recipe.recipe_Data import getRecipeDetails
from src.utils.data.data_Booleans import strToBool
from src.utils.env.env_AWSSecrets import checkIsDocker
from src.utils.logging.logging_Print import printSeperator, printRoundtrip, printArbitrageProfitable
from src.utils.logging.logging_Setup import setupLogging

# General Init
isDocker = checkIsDocker()
logger = setupLogging(isDocker)
useFallbackRoutes = strToBool(os.getenv("USE_FALLBACK_ROUTES"))

# Test Settings
forceRun = False
useTestCapital = False
startingCapitalTestAmount = 10

printSeperator()

# Firebase Setup
logger.info(f"Getting Data From Firebase")
printSeperator()
createDatabaseConnection()
recipes = getRecipeDetails()

printSeperator(True)

# Interval Set-Up
forceArb = strToBool(os.environ.get("FORCE_ARB"))
pauseTime = int(os.environ.get("ARBITRAGE_INTERVAL"))

printSeperator()
logger.info(f"Waiting For Arbitrage Opportunity...")
printSeperator(True)

while True:

    for recipesTitle, recipesDetails in recipes.items():

        recipe = recipesDetails.copy()

        recipe = determineArbitrageStrategy(recipe)

        printRoundtrip(recipe["status"]["currentRoundTripCount"])

        printSeperator()
        logger.info(f"[ARB #{recipe['status']['currentRoundTripCount']}] Getting Wallet Details & Balance")
        printSeperator()

        recipe = getWalletsInformation(recipe=recipe, printBalances=True)

        setupWallet(recipe=recipe)

        recipe = calculateArbitrageIsProfitable(recipe)

        printSeperator(True)

        if recipe["arbitrage"]["isProfitable"] or forceArb:

            recipe = printArbitrageProfitable(recipe)

            recipe["status"]["startingTime"] = time.perf_counter()

            executeArbitrage(recipe=recipe)

        else:
            printSeperator()
            logger.info(f'[ARB #{recipe["status"]["currentRoundTripCount"]}] Trip Not Profitable')
            if pauseTime > 0:
                logger.info(f'Waiting {pauseTime} seconds...')
            printSeperator(True)
            time.sleep(pauseTime)
