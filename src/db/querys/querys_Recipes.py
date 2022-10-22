import os, json, collections
from src.db.actions.actions_Setup import getCursor, initDBConnection
from src.utils.data.data_Booleans import strToBool
from src.utils.sql.sql_File import executeScriptsFromFile
import os.path

def getRecipesFromDB():

    dBConnection = initDBConnection()

    cursor = getCursor(
        dbConnection=dBConnection
    )

    cacheLocation = "src/db/cache/recipes-cache.json"
    cacheExists = os.path.isfile(cacheLocation)
    USE_RECIPE_CACHE = strToBool(os.getenv("USE_RECIPE_CACHE"))

    if USE_RECIPE_CACHE and cacheExists:

        recipes = json.load(open(cacheLocation))

    else:

        recipes = executeScriptsFromFile(
            cursor=cursor,
            filename="get-recipes.sql"
        )

        with open(cacheLocation, 'w') as cacheJson:
            cacheJson.write(json.dumps(recipes, indent=4))

    splitDict = collections.defaultdict(list)

    for recipe in recipes:
        splitDict[recipe['recipe_group_id']].append(recipe)

    splitRecipes = list(splitDict.values())  # Python 3

    return splitRecipes