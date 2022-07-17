import os
import time

from dotenv import load_dotenv

load_dotenv()

# Utility modules
from src.utils.general import checkIsDocker, printSeperator, printRoundtrip, printArbitrageProfitable, strToBool, printSettingUpArbitrage
from src.utils.logger import setupLogging

# Selenium modules
from src.web.actions import initBrowser

# API modules
from src.api.firebase import createDatabaseConnection

# Data modules
from src.data.recipe import getRecipeDetails
from src.data.arbitrage import determineArbitrageStrategy, checkArbitrageIsProfitable, executeArbitrage, setupArbitrage

# Wallet modules
from src.wallet.queries.network import getWalletsInformation

# General Init
isDocker = checkIsDocker()
logger = setupLogging(isDocker)
useFallbackRoutes = strToBool(os.getenv("USE_FALLBACK_ROUTES"))

# Test Settings
forceRun = False
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
pauseTime = int(os.environ.get("ARBITRAGE_INTERVAL"))

printSeperator()
logger.info(f"Waiting For Arbitrage Opportunity...")
printSeperator(True)

if not useFallbackRoutes:
    originDriver = initBrowser(profileToUse=1)
    destinationDriver = initBrowser(profileToUse=2)
else:
    originDriver = None
    destinationDriver = None

while True:

    for recipesTitle, originalRecipes in recipes.items():

        recipe = originalRecipes.copy()

        recipe = determineArbitrageStrategy(recipe)

        currentRoundTripCount = recipe['arbitrage']['currentRoundTripCount']

        printRoundtrip(recipe["arbitrage"]["currentRoundTripCount"])

        printSeperator()
        logger.info(f"[ARB #{currentRoundTripCount}] Getting Wallet Details & Balance")
        printSeperator()

        recipe = getWalletsInformation(recipe=recipe, printBalances=True)

        # TEST STUFF ####################################

        if useTestCapital:
            recipe["destination"]["wallet"]["balances"]["stablecoin"] = startingCapitalTestAmount
            recipe["origin"]["wallet"]["balances"]["stablecoin"] = startingCapitalTestAmount

        # TEST STUFF ####################################

        printSeperator(True)

        # Setting Up Arb

        telegramSetupMessage = printSettingUpArbitrage(count=currentRoundTripCount)
        isProfitable, predictions = checkArbitrageIsProfitable(recipe, originDriver=originDriver, destinationDriver=destinationDriver)
        setupArbitrage(recipe=recipe, predictions=predictions, telegramSetupMessage=telegramSetupMessage)

        printSeperator(True)

        # Do init setup - buy tokens + bridge, then wait until profitable to swap and bridge back.

        if isProfitable:

            telegramStatusMessage = printArbitrageProfitable(currentRoundTripCount, predictions)

            startingTime = time.perf_counter()

            outcome = executeArbitrage(recipe=recipe, predictions=predictions, startingTime=startingTime, telegramStatusMessage=telegramStatusMessage)

        else:
            printSeperator()
            logger.info(f'[ARB #{recipe["arbitrage"]["currentRoundTripCount"]}] Trip Not Profitable')
            logger.info(f'Waiting {pauseTime} seconds...')
            printSeperator(True)
            time.sleep(pauseTime)