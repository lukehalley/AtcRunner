import time
from decimal import Decimal

from src.utils.files.files_Directory import percentage, getProjectLogger

logger = getProjectLogger()

# Get the wei amount of a value from int value
def getTokenDecimalValue(amount, decimalPlaces=18):
    return str(format(Decimal(amount) * (10 ** decimalPlaces), f'.0f'))

# Get the int amount of a value from wei value
def getTokenNormalValue(amount, decimalPlaces=18):
    return str(format(Decimal(amount) / (10 ** decimalPlaces), f'.{decimalPlaces}f'))

# Get a value with a percentage of slippage
def getValueWithSlippage(amount, slippage=0.5):
    return amount - percentage(slippage, amount)

# Calculate the future transaction deadline timestamp for given seconds
def getTransactionDeadline(timeInSeconds=300):
    return int(time.time() + timeInSeconds)

# Calculate true swapped amount
def getTrueSwappedAmount(amountBefore, amountAfter):
    return abs(amountAfter - (amountAfter - amountBefore))