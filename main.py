import os
import time

from dotenv import load_dotenv

load_dotenv()

# Utility modules
from src.utils.general import checkIsDocker, printSeperator, printRoundtrip, printArbitrageProfitable, strToBool
from src.utils.logger import setupLogging

# Selenium modules
from src.web.actions import initBrowser

# API modules
from src.api.firebase import createDatabaseConnection

# Data modules
from src.data.recipe import getRecipeDetails
from src.data.arbitrage import determineArbitrageStrategy, checkArbitrageIsProfitable, executeArbitrage
from src.data.kitchen import testMasterList

# Wallet modules
from src.wallet.actions.swap import setupWallet
from src.wallet.queries.network import getWalletsInformation

testMasterList()

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

# while True:
#
#     for recipesTitle, recipesDetails in recipes.items():
#
#         recipe = recipesDetails.copy()
#
#         recipe = determineArbitrageStrategy(recipe)
#
#         printRoundtrip(recipe["arbitrage"]["currentRoundTripCount"])
#
#         printSeperator()
#         logger.info(f"[ARB #{recipe['arbitrage']['currentRoundTripCount']}] Getting Wallet Details & Balance")
#         printSeperator()
#
#         recipe = getWalletsInformation(recipe=recipe, printBalances=True)
#
#         setupWallet(recipe=recipe)
#
#         isProfitable, predictions = checkArbitrageIsProfitable(recipe, originDriver=originDriver, destinationDriver=destinationDriver)
#
#         printSeperator(True)
#
#         if isProfitable:
#
#             telegramStatusMessage = printArbitrageProfitable(recipe['arbitrage']['currentRoundTripCount'], predictions)
#
#             startingTime = time.perf_counter()
#
#             executeArbitrage(recipe=recipe, predictions=predictions, startingTime=startingTime, telegramStatusMessage=telegramStatusMessage)
#
#         else:
#             printSeperator()
#             logger.info(f'[ARB #{recipe["arbitrage"]["currentRoundTripCount"]}] Trip Not Profitable')
#             if pauseTime > 0:
#                 logger.info(f'Waiting {pauseTime} seconds...')
#             printSeperator(True)
#             time.sleep(pauseTime)