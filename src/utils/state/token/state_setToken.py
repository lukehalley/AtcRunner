from src.utils.state.token.state_positionUtils import getOppositeToken

def setCurrentToken(recipe, newToken):

    recipe["status"]["token"]["currentToken"] = newToken
    recipe["status"]["token"]["currentOppositeToken"] = getOppositeToken(token=newToken)

    return recipe