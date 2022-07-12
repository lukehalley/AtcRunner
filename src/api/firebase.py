import logging, os
from typing import Optional
from firebase_admin import credentials, initialize_app, db
from src.utils.general import getAWSSecret

# Setup logging
logger = logging.getLogger("DFK-DEX")

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