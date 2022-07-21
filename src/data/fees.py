import logging

# Set up our logging
logger = logging.getLogger("DFK-DEX")

# Add a fee to our recipe dict and add up the current sub-totals and totals
def addFee(recipe, fee, section):

    if "fees" not in recipe["status"]:
        recipe["status"]["fees"] = {}

    if "total" not in recipe["status"]["fees"]:
        recipe["status"]["fees"]["total"] = 0

    if section not in recipe["status"]["fees"]:
        recipe["status"]["fees"][section] = {}

    recipe["status"]["fees"][section]["subTotal"] = 0

    if type(fee) is dict:
        for title, value in fee.items():
            recipe["status"]["fees"][section][title] = value
        for k, v in recipe["status"]["fees"][section].items():
            if k != "subTotal":
                recipe["status"]["fees"][section]["subTotal"] = recipe["status"]["fees"][section]["subTotal"] + v
    elif type(fee) is int or type(fee) is float:
        feeName = f'{section}_{len(recipe["status"]["fees"][section])}'
        recipe["status"]["fees"][section][feeName] = fee
        x = 1
        for k, v in recipe["status"]["fees"][section].items():
            if k != "subTotal":
                recipe["status"]["fees"][section]["subTotal"] = recipe["status"]["fees"][section]["subTotal"] + v
    else:
        errMsg = f'Invalid fee: {fee}'
        logger.error(errMsg)
        raise Exception(errMsg)

    recipe["status"]["fees"]["total"] = 0

    for key, value in recipe["status"]["fees"].items():
        if key != "total":
            for feeName, feeAmount in value.items():
                if feeName == "subTotal":
                    recipe["status"]["fees"]["total"] = recipe["status"]["fees"]["total"] + feeAmount

    return recipe