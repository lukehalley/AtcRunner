# When our ABIs imported, if there is a blank field its not added.
# This causes errors, so this fills em back in.
def fillEmptyABIParams(abi, contractFunctionName):
    contractFunctionFields = {"inputs": [],
                              "name": "",
                              "outputs": [],
                              "statexMutability": "",
                              "type": ""}

    for abiFunction in abi:
        if "name" in abiFunction.keys():
            if abiFunction["name"] == contractFunctionName:
                functionToFix = abiFunction
                for fieldName, fieldReplacement in contractFunctionFields.items():
                    if fieldName not in functionToFix.keys():
                        functionToFix[fieldName] = fieldReplacement
                        break
                break

    return abi


def getMappedContractFunction(functionName, abiMapping):
    if functionName in abiMapping.keys():
        return abiMapping[functionName]
    else:
        return functionName
