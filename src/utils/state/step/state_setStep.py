def setCurrentStep(recipe, newStepName, newStepNumber):

    recipe["status"]["step"]["currentStepName"] = newStepName
    recipe["status"]["step"]["currentStepNumber"] = newStepNumber

    return recipe