import logging, os, json
from typing import Optional
from firebase_admin import credentials, initialize_app, db
from collections import OrderedDict

# Setup logging
logger = logging.getLogger("DFK-DEX")

# Create a connection to Firebase
def createDatabaseConnection():

    pkeyPath: Optional[str] = os.environ.get("PRIVATE_KEY_PATH")
    databaseURL = os.environ.get("DATABASE_URL")

    logger.info(f"DB: Creating connection to Firebase @ {databaseURL}")

    cred = credentials.Certificate(pkeyPath)
    initialize_app(cred, {
        'databaseURL': databaseURL
    })

    logger.info(f"DB: Connection established to Firebase")

# Fetch a collection from Firebase
def fetchFromDatabase(reference):

    logger.info(f"DB: Getting '{reference}' from Firebase")

    db.reference()

    queryResult = (db.reference(f"/{reference}/")).get()

    return queryResult

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

    ref = db.reference("/arbitrages")

    ref.set(arbitrages)