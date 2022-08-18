from src.utils.env.env_Docker import getAWSSecret
from src.utils.math.math_Logic import isBetween
from src.utils.math.math_Percentage import getPercentageOfNumber

# Get the private key from the AWS env vars
def getPrivateKey():
    return getAWSSecret(key="ARB_KEY")

# Check if balance is an expected amount with some room for error
def compareBalance(expected, actual, feeAllowancePercentage=10):
    feeAllowance = getPercentageOfNumber(feeAllowancePercentage, expected)

    expectedLower = expected - feeAllowance
    expectedUpper = expected + feeAllowance
    isInRange = isBetween(lowerLimit=expectedLower, middleNumber=actual, upperLimit=expectedUpper)

    if actual == expected or isInRange:
        return True
    else:
        return False

# Check if stables are on origin network
def checkIfStablesAreOnOrigin(recipe):
    return recipe["origin"]["wallet"]["balances"]["stablecoin"] > recipe["destination"]["wallet"]["balances"]["stablecoin"]
