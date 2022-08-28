# The primary dex is the main dex we trust to get the core details about our recipe
def getRecipePrimaryDex(chainRecipe):
    primaryDex = chainRecipe["chain"]["primaryDex"]
    return next(
        (index for (index, d) in enumerate(chainRecipe["dexs"])
         if d["name"] == primaryDex), None
    )