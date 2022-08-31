import sys

# Fetch an arbitrage strategy by its name
def fetchStrategy(recipe, strategyStepToFetch):
    strategySteps = recipe["arbitrage"]["strategy"]["steps"]

    if strategyStepToFetch in strategySteps.keys():
        return strategySteps[strategyStepToFetch]
    else:
        sys.exit(f"Strategy of type: {strategyStepToFetch} does not exist!")