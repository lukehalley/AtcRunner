from src.utils.logging.logging_Setup import getProjectLogger

logger = getProjectLogger()

# Generate a block explorer link fro a url and tx
def generateBlockExplorerLink(url, txid):
    return url + "/" + str(txid)