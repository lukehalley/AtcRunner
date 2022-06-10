import logging, os
from typing import Optional
from firebase_admin import credentials, initialize_app, db

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