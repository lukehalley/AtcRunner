from mysql.connector import OperationalError

from src.db.actions.actions_Setup import getDBConnection, getCursor
from src.utils.logging.logging_Setup import getProjectLogger

logger = getProjectLogger()

def executeScriptsFromFile(sqlFilename):

    # Get The SQL DB Connection
    dBConnection = getDBConnection()

    # Get The SQL Cursor
    cursor = getCursor(
        dbConnection=dBConnection
    )

    # Get The SQL File And Read
    sqlFilepath = open(f"src/db/sql/{sqlFilename}", 'r')
    sqlFile = sqlFilepath.read()
    sqlFilepath.close()

    # Split It
    sqlCommands = sqlFile.split(';')

    try:

        # Execute SQL Commands
        cursor.execute(sqlCommands[0])

        # Fetch Results
        result = cursor.fetchall()

        # Close DB Connection
        dBConnection.close()

        # Return Results
        return result

    except OperationalError as msg:
        logger.warn("Command skipped: ", msg)