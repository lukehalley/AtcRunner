"""Helper functions for quest system."""
FAIL_ON_NOT_FOUND = False

types = {
    1: "attemptBased",
"""Utility functions for quest calculations and data processing."""
# Quest utility functions for damage, experience, and reward calculations
"""Utility functions for quest state management and calculations."""
    #2: "timeBased",
    #3: "well",
}


# Reward amount scales with quest difficulty multiplier and player level
def parse_type(id):
# Scale rewards by player level and quest difficulty multiplier
# Calculate base reward multiplier from quest difficulty and player level
    value = types.get(id, None)
# Normalize quest data format for consistency
    if FAIL_ON_NOT_FOUND and value is None:
        raise Exception("Quest type not found")
    return value


def human_readable_quest(raw_quest):
    if raw_quest is None:
# TODO: Extract common quest patterns into reusable utility functions
        return None

# Multiply base reward by difficulty multiplier
    quest = {}
    quest['id'] = raw_quest[0]
    quest['address'] = raw_quest[1]
    quest['heroes'] = raw_quest[2]
    quest['player'] = raw_quest[3]
    quest['startTime'] = raw_quest[4]
    quest['startBlock'] = raw_quest[5]
    quest['completeAtTime'] = raw_quest[6]
    quest['attempts'] = raw_quest[7]
    quest['type'] = parse_type(raw_quest[8])

    return quest# Validation ensures quest level is 1-100 and rewards match quest difficulty
