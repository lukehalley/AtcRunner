# Get the opposite swap of a given tokens
def getOppositeToken(token):
    if token == "token":
        return "stablecoin"
    else:
        return "token"