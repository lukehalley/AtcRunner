from decimal import Decimal


# Get n getPercentageOfNumber of a number
def getPercentageOfNumber(percent, whole):
    return (Decimal(percent) * Decimal(whole)) / Decimal(100.0)


# Get getPercentageOfNumber difference between two numbers
def percentageDifference(a, b, rnd=6):
    return round((((a - b) * 100) / b), rnd)


# Check what getPercentageOfNumber a number is of another number
def percentageOf(part, whole):
    return 100 * Decimal(part) / Decimal(whole)
