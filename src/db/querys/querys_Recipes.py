import collections
import json
import os
import os.path

from src.db.actions.actions_Setup import getCursor, initDBConnection
from src.utils.data.data_Booleans import strToBool
from src.utils.sql.sql_File import executeScriptsFromFile


def getRecipesFromDB():
    # Get The SQL DB Connection
    dBConnection = initDBConnection()

    # Get The SQL Cursor
    cursor = getCursor(
        dbConnection=dBConnection
    )

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
            cursor=cursor,
            filename="get-recipes.sql"
        )

        # Write The Retrieved Recipes To The DB
        with open(cacheLocation, 'w') as cacheJson:
            cacheJson.write(json.dumps(recipes, indent=4))

    # New Dict For The Init Split
    splitDict = collections.defaultdict(list)

    # First Split By Group Id
    for recipe in recipes:
        splitDict[recipe['recipe_group_id']].append(recipe)

    splitRecipes = list(splitDict.values())

    finalSplitRecipes = []
    for splitRecipe in splitRecipes:

        finalGroup = {}

        listOfRecipes = [x.items() for x in splitRecipe]
        commonRecipeInfo = dict(set(listOfRecipes[0]).intersection(*listOfRecipes))
        keysToPop = list(commonRecipeInfo.keys())

        finalPairs = []

        for recipe in splitRecipe:  # my_list if the list that you have in your question
            for key in keysToPop:
                del recipe[key]
            finalPairs.append(recipe)

        finalGroup["common"] = commonRecipeInfo
        finalGroup["pairs"] = finalPairs

        finalSplitRecipes.append(finalGroup)

    return finalSplitRecipes
