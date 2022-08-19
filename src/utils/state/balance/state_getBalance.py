from src.utils.state.position.state_getPosition import getCurrentPositions

def getRecipeTokenBalance(recipe, token):

    currentPosition, currentOppositePosition = getCurrentPositions(recipe=recipe)

    return recipe[currentPosition]["wallet"]["balances"][token]