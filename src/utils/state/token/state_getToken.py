def getCurrentTokens(recipe):

    currentToken = recipe["status"]["token"]["currentToken"]
    currentOppositeToken = recipe["status"]["token"]["currentOppositeToken"]

    return currentToken, currentOppositeToken