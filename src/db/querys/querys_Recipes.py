import collections
import json
import os
import os.path

from src.db.actions.actions_Setup import getCursor, getDBConnection
from src.db.querys.querys_Routes import getRoutesFromDB
from src.utils.data.data_Booleans import strToBool
from src.utils.sql.sql_File import executeScriptsFromFile


def getRecipesFromDB():

    # Configure The Recipe Cache
    cacheLocation = "src/db/cache/recipes-cache.json"
    cacheExists = os.path.isfile(cacheLocation)
    USE_RECIPE_CACHE = strToBool(os.getenv("USE_RECIPE_CACHE"))

    # If Cache Is Enabled And Cache File Exists
    if USE_RECIPE_CACHE and cacheExists:

        recipes = json.load(open(cacheLocation))

    # Else Retrieve Recipes From The DB
    else:

        # Execute Arb SQL Query
        recipes = executeScriptsFromFile(
            sqlFilename="get-recipes.sql"
        )

        # Write The Retrieved Recipes To The DB
        with open(cacheLocation, 'w') as cacheJson:
            cacheJson.write(json.dumps(recipes, indent=4))

    # New Dict For The Init Split
    splitDict = collections.defaultdict(list)

    # First Split By Group Id
    for dexPair in recipes:
        splitDict[dexPair['recipe_group_id']].append(dexPair)

    # Split Recipes By Their Group Id
    splitRecipes = list(splitDict.values())

    # The Final List Of Recipes
    finalSplitRecipes = []

    # Loop Through Recipes
    for splitRecipe in splitRecipes:

        # Final Recipe Group Dict
        finalGroup = {}

        # Get The Common Keys And Keep Them In A Separate Dict
        listOfRecipes = [x.items() for x in splitRecipe]
        commonRecipeInfo = dict(set(listOfRecipes[0]).intersection(*listOfRecipes))
        keysToPop = list(commonRecipeInfo.keys())
        finalGroup["common"] = commonRecipeInfo

        # List Of Pairs
        finalPairs = []

        # Remove Common Pairs And Get Routes For Pairs For Their Dex
        for dexPair in splitRecipe:

            for key in keysToPop:
                del dexPair[key]

            # Get Pair Routes
            dexPair["routes"] = getRoutesFromDB(
                network_DbId=commonRecipeInfo["network_db_id"],
                dex_DbId=dexPair["dex_db_id"],
                inToken_DbId=commonRecipeInfo["primary_token_db_id"],
                outToken_DbId=commonRecipeInfo["secondary_token_db_id"]
            )

            if dexPair["routes"]:
                finalPairs.append(dexPair)

        finalGroup["pairs"] = finalPairs

        if finalGroup["pairs"]:
            finalSplitRecipes.append(finalGroup)

    return finalSplitRecipes
