import time

from src.utils.logging.logging_Setup import getProjectLogger

from src.utils.math.math_Percentage import getPercentageOfNumber
logger = getProjectLogger()

# Get a value with a getPercentageOfNumber of slippage
def getValueWithSlippage(amount, slippage=0.5):
    return amount - getPercentageOfNumber(slippage, amount)

# Calculate the future transaction deadline timestamp for given seconds
def getTransactionDeadline(timeInSeconds=300):
    return int(time.time() + timeInSeconds)

# Calculate true swapped amount
def getTrueSwappedAmount(amountBefore, amountAfter):
    return abs(amountAfter - (amountAfter - amountBefore))