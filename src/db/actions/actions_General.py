from src.db.actions.actions_Setup import getDBConnection, getCursor
from src.utils.logging.logging_Setup import getProjectLogger

logger = getProjectLogger()

def executeReadQuery(query):

    # Get The SQL DB Connection
    dBConnection = getDBConnection()

    # Get The SQL Cursor
    cursor = getCursor(
        dbConnection=dBConnection
    )

    # Execute Query
    cursor.execute(query)

    # Get Results
    results = cursor.fetchall()

    # Close DB Connection
    dBConnection.close()

    # Return Results
    return results

def executeWriteQuery(query):

    # Get The SQL DB Connection
    dBConnection = getDBConnection()

    # Get The SQL Cursor
    cursor = getCursor(
        dbConnection=dBConnection
    )

    # Execute Query
    cursor.execute(query)

    # Commit Query
    dBConnection.commit()

    # Close DB Connection
    dBConnection.close()

