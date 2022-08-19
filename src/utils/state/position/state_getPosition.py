def getCurrentPositions(recipe):

    currentPosition = recipe["status"]["position"]["currentPosition"]
    currentOppositePosition = recipe["status"]["position"]["currentOppositePosition"]

    return currentPosition, currentOppositePosition