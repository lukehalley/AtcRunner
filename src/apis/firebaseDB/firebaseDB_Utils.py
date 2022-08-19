import os

from firebase_admin import credentials, initialize_app

from src.utils.env.env_Docker import getAWSSecret
from src.utils.logging.logging_Print import printSeperator
from src.utils.logging.logging_Setup import getProjectLogger

logger = getProjectLogger()

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

    logger.info(f"Creating connection to Firebase...")

    cred = credentials.Certificate(firebaseAuth)
    initialize_app(cred, {
        'databaseURL': databaseURL
    })

    logger.info(f"Connection established to Firebase")

    printSeperator(True)
