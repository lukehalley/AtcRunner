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
        logger.info(f"DB: Getting '{reference}' from Firebase")

    ref = fetchEnvCollection(collection=reference)

    queryResult = ref.get()

    return queryResult

# Fetch an arbitrage strategy by its name
def fetchArbitrageStrategy(strategyName: str):
    strategies = fetchFromDatabase("strategies")

    return strategies[strategyName]