import sys

from firebase_admin import db

from src.utils.env.env_AWSSecrets import checkIsDocker
from src.utils.logging.logging_Setup import getProjectLogger

logger = getProjectLogger()

# Get collection for current env
def fetchEnvCollection(collection):
    isProd = checkIsDocker()

    if isProd:
        ref = db.reference(f"/prod/{collection}")
    else:
        ref = db.reference(f"/dev/{collection}")

    return ref


# Fetch a collection from Firebase
def fetchFromDatabase(reference: str, printInfo=False):
    if printInfo:
        logger.info(f"Getting '{reference}' from Firebase")

    ref = fetchEnvCollection(collection=reference)

    queryResult = ref.get()

    return queryResult

# Fetch an arbitrage strategy by its name
def fetchStrategy(recipe, strategyType):
    strategies = fetchFromDatabase("strategies")

    strategyName = recipe["arbitrage"]["strategies"][strategyType]

    if strategyName in strategies:
        return strategies[strategyName]
    else:
        sys.exit(f"Strategy of type: {strategyType} with name: {strategyName} does not exist!")