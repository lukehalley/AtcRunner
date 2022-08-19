# Get the opposite arb direction
def getOppositePosition(direction):
    if direction == "origin":
        return "destination"
    elif direction == "destination":
        return "origin"
    elif direction == "chainOne":
        return "chainTwo"
    elif direction == "chainTwo":
        return "chainOne"
    else:
        sys.exit(f"Invalid direction: {direction}")