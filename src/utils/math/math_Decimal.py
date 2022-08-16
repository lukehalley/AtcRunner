from decimal import Decimal

import math

# Find exponent of a number
def getExponent(number) -> int:
    base10 = math.log10(abs(number))
    return abs(math.floor(base10))

# Move a decimal point for a float
def moveDecimalPoint(num, decimal_places):
    num = Decimal(num)

    for _ in range(abs(decimal_places)):

        if decimal_places > 0:
            num *= 10
        else:
            num /= 10.

    return Decimal(num)

# Truncate a float
def truncateDecimal(f, n):
    return math.floor(f * 10 ** n) / 10 ** n