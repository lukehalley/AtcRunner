import logging
import sys

import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
from typing import Optional
from dotenv import load_dotenv
import os

logger = logging.getLogger("DFK-DEX")

def createDatabaseConnection():

    # Firebase Envs
    load_dotenv()
    pkeyPath: Optional[str] = os.environ.get("PRIVATE_KEY_PATH")
    databaseURL = os.environ.get("DATABASE_URL")

    logger.info(f"DB: Creating connection to Firebase @ {databaseURL}")

    # Firebase Init
    cred = credentials.Certificate(pkeyPath)
    firebase_admin.initialize_app(cred, {
        'databaseURL': databaseURL
    })

    logger.info(f"DB: Connection established to Firebase")

def fetchFromDatabase(reference):

    logger.info(f"DB: Getting '{reference}' from Firebase")

    db.reference()

    queryResult = (db.reference(f"/{reference}/")).get()

    logger.debug(f"DB: Firebase query returned dictionary of {len(queryResult)} rows")

    return queryResult