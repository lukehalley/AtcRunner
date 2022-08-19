from src.utils.state.position.state_positionUtils import getOppositePosition

def setCurrentPosition(recipe, newPosition):

    recipe["status"]["position"]["currentPosition"] = newPosition
    recipe["status"]["position"]["currentOppositePosition"] = getOppositePosition(direction=newPosition)

    return recipe