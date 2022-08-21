# Check if number is between two value
def isBetween(lowerLimit, middleNumber, upperLimit):
    return min(lowerLimit, upperLimit) < middleNumber < max(lowerLimit, upperLimit)
