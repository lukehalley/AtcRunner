from mysql.connector import OperationalError

from src.utils.logging.logging_Setup import getProjectLogger

logger = getProjectLogger()

def executeScriptsFromFile(cursor, filename):
    fd = open(f"src/db/sql/{filename}", 'r')
    sqlFile = fd.read()
    fd.close()

    sqlCommands = sqlFile.split(';')

    try:
        cursor.execute(sqlCommands[0])
        result = cursor.fetchall()
        return result
    except OperationalError as msg:
        logger.warn("Command skipped: ", msg)