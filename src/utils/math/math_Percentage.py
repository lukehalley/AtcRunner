from decimal import Decimal

# Get n percentage of a number
def percentage(percent, whole):
  return (Decimal(percent) * Decimal(whole)) / Decimal(100.0)

# Get percentage difference between two numbers
def percentageDifference(a, b, rnd=6):
    return round((((a - b) * 100) / b), rnd)

# Check what percentage a number is of another number
def percentageOf(part, whole):
  return 100 * Decimal(part)/Decimal(whole)