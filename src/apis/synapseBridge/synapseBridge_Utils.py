import os

from src.utils.web.web_Requests import safeRequest
from src.utils.files.files_Directory import getProjectLogger

logger = getProjectLogger()

# Build the Synapse API base URL
def buildSynapseAPIBaseURL():

    # Build the base of our API endpoint url
    synapseAPIEndpoint = os.getenv("SYNAPSE_API_ENDPOINT")
    synapseAPIVersion = os.getenv("SYNAPSE_API_VERSION")
    synapseAPIBaseURL = synapseAPIEndpoint + "/" + synapseAPIVersion

    return synapseAPIBaseURL

# Call Synapse allowing for their case being incorrect
def callSynapseTokenCaseRetry(endpoint: str, params: dict):

    lowerFrom = params["fromToken"].lower()
    lowerTo = params["toToken"].lower()

    try:
        result = safeRequest(endpoint=endpoint, params=params)
    except:
        # If we fail, try and lower the fromToken
        lowerFromParams = params.copy()
        lowerFromParams["fromToken"] = lowerFrom
        try:
            result = safeRequest(endpoint=endpoint, params=lowerFromParams)
        except:
            # If we fail again, try and lower the toToken
            lowerToParams = params.copy()
            lowerToParams["toToken"] = lowerTo
            result = safeRequest(endpoint=endpoint, params=lowerToParams)
    return result
