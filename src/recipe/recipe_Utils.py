from src.utils.text.text_Transformation import camelCaseSplit

def getHumanReadableRecipeType(recipeType):
    return " ".join(camelCaseSplit(stringToSplit=recipeType)).title()