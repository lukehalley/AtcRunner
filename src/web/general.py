import os

def getOppositeDirection(direction):
    if direction == "input":
        return "output"
    else:
        return "input"

def getMetamaskURL():
    return f'chrome-extension://{os.environ.get("MM_EXT_STR")}/home.html#'