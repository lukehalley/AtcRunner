from pathlib import Path


# Get the root of the python project
def getProjectRoot() -> Path:
    return Path(__file__).parent.parent
