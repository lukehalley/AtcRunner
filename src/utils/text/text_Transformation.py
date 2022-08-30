import re

# Split by camelcase
def camelCaseSplit(stringToSplit):
    matches = re.finditer('.+?(?:(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])|$)', stringToSplit)
    return [m.group(0) for m in matches]
