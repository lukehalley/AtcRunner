def getCurrentStepNameAndNumber(recipe):

    currentStepName = recipe["status"]["step"]["currentStepName"]
    currentStepNumber = recipe["status"]["step"]["currentStepNumber"]

    return currentStepName, currentStepNumber