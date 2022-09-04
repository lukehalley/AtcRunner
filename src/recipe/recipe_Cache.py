import os
import pickle
from src.utils.files.files_Directory import getProjectRoot

projectRoot = getProjectRoot()
recipeCachePath = os.path.join(projectRoot, "cache", "recipe.pkl")

def saveRecipeCache(recipe):
    with open(recipeCachePath, 'wb') as f:
        pickle.dump(recipe, f)

def loadRecipeCache():
    with open(recipeCachePath, 'rb') as f:
        return pickle.load(f)

def checkRecipeCacheExists():
    return os.path.isfile(recipeCachePath)