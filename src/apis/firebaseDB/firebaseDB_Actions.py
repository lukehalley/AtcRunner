from src.apis.firebaseDB.firebaseDB_Querys import fetchFromDatabase, fetchEnvCollection
from src.utils.logging.logging_Setup import getProjectLogger

logger = getProjectLogger()


# Write a transaction to Firebase
def writeTransactionToDB(transaction: dict, currentRoundTrip: int, stepCategory: str):
    arbitrageTitle = f"arbitrage_{currentRoundTrip}"

    arbitrages = fetchFromDatabase("arbitrages")

    if not arbitrages:
        arbitrages = {}

    if arbitrageTitle not in arbitrages:
        arbitrages[arbitrageTitle] = {}

    nextStepNumber = len(arbitrages[arbitrageTitle].keys()) + 1
    stepTitle = f"{nextStepNumber}_{stepCategory}"

    arbitrages[arbitrageTitle][stepTitle] = transaction

    ref = fetchEnvCollection(collection="arbitrages")

    ref.set(arbitrages)


# Write a arbitrage result to Firebase
def writeResultToDB(result: dict, currentRoundTrip: int):
    arbitrageTitle = f"arbitrage_{currentRoundTrip}"

    arbitrages = fetchFromDatabase("arbitrages")

    if arbitrages:

        if arbitrageTitle not in arbitrages:

            err = f"Tried to write profit/loss to DB but {arbitrageTitle} didn't exist!"
            logger.error(err)
            raise Exception(err)

        else:

            arbitrages[arbitrageTitle]["result"] = result

            ref = fetchEnvCollection(collection="arbitrages")

            ref.set(arbitrages)

    else:
        err = "Tried to write profit/loss to DB the arbitrages collection didn't exist!"
        logger.error(err)
        raise Exception(err)
