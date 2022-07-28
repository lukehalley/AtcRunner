import logging
import os
import sys

from firebase_admin import credentials, initialize_app, db

from src.utils.general import getAWSSecret, checkIsDocker

# Setup logging
logger = logging.getLogger("DFK-DEX")

def getReference(collection):
    isProd = checkIsDocker()

    if isProd:
        ref = db.reference(f"/prod/{collection}")
    else:
        ref = db.reference(f"/dev/{collection}")

    return ref

# Create a connection to Firebase
def createDatabaseConnection():
    databaseURL = os.environ.get("DATABASE_URL")

    firebaseKey = getAWSSecret(key="FIREBASE_KEY").replace("\\n", "\n")

    firebaseAuth = {
        "type": "service_account",
        "project_id": "dfk-arbitrage",
        "private_key_id": "3c7781d9851753c4fbe43203b0aacfd7f5a8c921",
        "private_key": firebaseKey,
        "client_email": "firebase-adminsdk-w91wo@dfk-arbitrage.iam.gserviceaccount.com",
        "client_id": "117235103434626746458",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-w91wo%40dfk-arbitrage.iam.gserviceaccount.com"
    }

    logger.info(f"DB: Creating connection to Firebase @ {databaseURL}")

    cred = credentials.Certificate(firebaseAuth)
    initialize_app(cred, {
        'databaseURL': databaseURL
    })

    logger.info(f"DB: Connection established to Firebase")


# Fetch a collection from Firebase
def fetchFromDatabase(reference, printInfo=False):
    if printInfo:
        logger.info(f"DB: Getting '{reference}' from Firebase")

    ref = getReference(collection=reference)

    queryResult = ref.get()

    return queryResult

def fetchArbitrageStrategy(strategyName):
    strategies = fetchFromDatabase("strategies")

    return strategies[strategyName]

def writeTransactionToDB(transaction, arbitrageNumber, stepCategory):
    arbitrageTitle = f"arbitrage_{arbitrageNumber}"

    arbitrages = fetchFromDatabase("arbitrages")

    if not arbitrages:
        arbitrages = {}

    if arbitrageTitle not in arbitrages:

        arbitrages[arbitrageTitle] = {}

        arbitrages[arbitrageTitle][stepCategory] = transaction

    else:

        arbitrages[arbitrageTitle][stepCategory] = transaction

    ref = getReference(collection="arbitrages")

    ref.set(arbitrages)


def writeResultToDB(result, arbitrageNumber):
    arbitrageTitle = f"arbitrage_{arbitrageNumber}"

    arbitrages = fetchFromDatabase("arbitrages")

    if arbitrages:

        if arbitrageTitle not in arbitrages:

            err = f"Tried to write profit/loss to DB but {arbitrageTitle} didn't exist!"
            logger.error(err)
            sys.exit(err)

        else:

            arbitrages[arbitrageTitle]["result"] = result

            ref = getReference(collection="arbitrages")

            ref.set(arbitrages)

    else:
        err = "Tried to write profit/loss to DB the arbitrages collection didn't exist!"
        logger.error(err)
        sys.exit(err)
