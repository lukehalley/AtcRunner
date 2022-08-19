import sys

from src.apis.firebaseDB.firebaseDB_Querys import fetchFromDatabase
from src.utils.logging.logging_Setup import getProjectLogger

logger = getProjectLogger()

# Get the next arbitrage number using the arbitrages collection in Firebase
def getNextArbitrageNumber():
    arbitrages = fetchFromDatabase("arbitrages")
    if arbitrages:
        return sorted([int(w.replace('arbitrage_', '')) for w in list(arbitrages.keys())])[-1] + 1
    else:
        return 1

# Get the routes for tokens we are swapping from -> to in the recipe dict
def getRoutes(recipe, position, toSwapFrom, toSwapTo):
    return recipe[position]["routes"][f"{toSwapFrom}-{toSwapTo}"]