import os, time
from dotenv import load_dotenv

from src.db.querys.querys_Recipes import getRecipesFromDB
from src.utils.aws.aws_S3 import downloadAbisFromS3

load_dotenv()

# Firebase Imports
from src.apis.firebaseDB.firebaseDB_Utils import createDatabaseConnection

# Arbitrage Imports
from src.arbitrage.arbitrage_Calculate import calculateArbitrageIsProfitable, determineArbitrageStrategy
from src.arbitrage.arbitrage_Execute import executeArbitrage

# Chain Imports
from src.chain.network.network_Querys import getWalletsInformation
from src.chain.swap.swap_Actions import setupWallet

# Recipe Imports
from src.recipe.recipe_Recipes import getRecipeDetails

# Multiprocessing Imports
from multiprocessing import Pool

# Util Imports
from src.utils.data.data_Booleans import strToBool
from src.utils.env.env_AWSSecrets import checkIsDocker
from src.utils.logging.logging_Print import printSeparator, printRoundtrip, printArbitrageProfitable
from src.utils.logging.logging_Setup import setupLogging

# General Init
isDocker = checkIsDocker()
logger = setupLogging(isDocker)
useFallbackRoutes = strToBool(os.getenv("USE_FALLBACK_ROUTES"))

# Test Settings
forceRun = False
useTestCapital = False
startingCapitalTestAmount = 10

def processRecipes(splitRecipes):

    lenRecipes = len(splitRecipes)

    logger.info(lenRecipes)

    return lenRecipes

def startATCRunner():

    # Get Recipes From MYSQL DB
    printSeparator()
    logger.info(f"Getting Recipes From DB")
    printSeparator()
    splitRecipes = getRecipesFromDB()
    logger.info(f"Retrieved {len(splitRecipes)} Recipes")
    printSeparator(newLine=True)

    # Download All Out Abis From S3
    printSeparator()
    logger.info(f"Syncing Abis From S3")
    printSeparator()
    downloadAbisFromS3()
    printSeparator(newLine=True)

    # TODO: Remove - Limit For Testing
    splitRecipes = splitRecipes[0:3]

    # Simulate All Recipes
    printSeparator()
    logger.info(f"Simulating Recipes")
    printSeparator()

    # Create A Pool For Recipe Simulation
    recipeSimulationPool = Pool(processes=len(splitRecipes))

    # Map Our Recipes To The Pool An Run
    simulationResults = recipeSimulationPool.map(processRecipes, splitRecipes)

    x = 1

# Driver code
if __name__ == '__main__':
    startATCRunner()

# # Print A Separator
# printSeparator()
#
# # Firebase Setup
# logger.info(f"Getting Data From Firebase")
# printSeparator()
# createDatabaseConnection()
# recipes = getRecipeDetails()
#
# # Print A Separator
# printSeparator(newLine=True)
#
# # Interval Set-Up
# arbEnabled = strToBool(os.environ.get("ARB_ENABLED"))
# forceArb = strToBool(os.environ.get("FORCE_ARB"))
# pauseTime = int(os.environ.get("ARBITRAGE_INTERVAL"))
#
# # Infinite Loop
# while True:
#
#     # Iterate Through Recipe List
#     for recipesTitle, recipesDetails in recipes.items():
#
#         # Make A Copy Of The Current Recipe So We Don't Edit Original
#         recipe = recipesDetails.copy()
#
#         # Determine Our Arbitrage Strategy
#         recipe = determineArbitrageStrategy(recipe)
#
#         # Print The Current Round Trip Number
#         printRoundtrip(recipe["status"]["currentRoundTrip"])
#
#         # Print A Separator
#         printSeparator()
#
#         # Get The Current Wallet Token Balances
#         logger.info(f"[ARB #{recipe['status']['currentRoundTrip']}] Getting Wallet Details & Balance")
#         recipe = getWalletsInformation(recipe=recipe, printBalances=True)
#
#         # Print A Separator
#         printSeparator(newLine=True)
#
#         # Check If Our Wallet Is In The Correct State To Begin
#         # The Arbitrage - ie. Majority Stablecoins
#         setupWallet(
#             recipe=recipe,
#             recipePosition="origin",
#             tokenType="token",
#             stepCategory="setup"
#         )
#
#         # Check If The Current Arbitrage Would Be Profitable
#         recipe = calculateArbitrageIsProfitable(recipe)
#
#         # Print A Separator
#         printSeparator(newLine=True)
#
#         # If Our Arbitrage Is Profitable - Execute It
#         if (recipe["arbitrage"]["isProfitable"] or forceArb) and arbEnabled:
#
#             # Start A Timer To Track How Long The Arbitrage Takes
#             recipe["status"]["startingTime"] = time.perf_counter()
#
#             # Print A Message Notifying The Arbitrage Is Profitable
#             recipe = printArbitrageProfitable(recipe)
#
#             # Execute The Arbitrage
#             executeArbitrage(
#                 recipe=recipe,
#                 isRollback=False
#             )
#
#         else:
#             printSeparator()
#             logger.info(f'[ARB #{recipe["status"]["currentRoundTrip"]}] Trip Not Profitable')
#             if pauseTime > 0:
#                 logger.info(f'Waiting {pauseTime} seconds...')
#             printSeparator(newLine=True)
#             time.sleep(pauseTime)
