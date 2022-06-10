# import logging, sys
#
# from num2words import num2words
# from srco import Database, Bridge, Dex
#
# logger = logging.getLogger("DFK-DEX")
#
# def getRecipeDetails():
#
#     chains = Database.fetchFromDatabase("chains")
#     recipes = Database.fetchFromDatabase("recipes")
#
#     for recipesTitle, recipeDetails in recipes.items():
#
#         recipeToken = recipeDetails["data"]["token"]
#         recipeStablecoin = recipeDetails["data"]["stablecoin"]
#
#         for i in range(1, 3):
#
#             num = num2words(i).title()
#             chain = chains[recipeDetails[f"chain{num}"]["chain"]["name"]]
#             recipeDetails[f"chain{num}"]["chain"].update(chain)
#
#             chainId = recipeDetails[f"chain{num}"]["chain"]["id"]
#
#             chainTokens = Bridge.getBridgeableTokens(chainId)
#
#             toFill = {
#                 "token": recipeToken,
#                 "stablecoin": recipeStablecoin
#             }
#
#             for key, value in toFill.items():
#
#                 for token in chainTokens:
#
#                     if token["symbol"] == value or token["name"] == value:
#
#                         tokenDetails = token
#
#                         if key == "chain":
#                             recipeDetails[f"chain{num}"][key]["isGas"] = True
#                         elif key in recipeDetails[f"chain{num}"]:
#                             recipeDetails[f"chain{num}"][key]["isGas"] = recipeDetails[f"chain{num}"][key]["isGas"]
#                         else:
#                             recipeDetails[f"chain{num}"][key] = {}
#                             recipeDetails[f"chain{num}"][key]["isGas"] = tokenDetails["isETH"]
#
#                         recipeDetails[f"chain{num}"][key]["name"] = tokenDetails["name"]
#                         recipeDetails[f"chain{num}"][key]["symbol"] = tokenDetails["symbol"]
#
#                         if "decimals" in tokenDetails:
#                             recipeDetails[f"chain{num}"][key]["decimals"] = tokenDetails["decimals"][chainId]
#                         else:
#                             recipeDetails[f"chain{num}"][key]["decimals"] = None
#
#                         recipeDetails[f"chain{num}"][key]["address"] = tokenDetails["addresses"][chainId]
#                         recipeDetails[f"chain{num}"][key]["swapType"] = tokenDetails["swapType"]
#                         recipeDetails[f"chain{num}"][key]["wrapperAddresses"] = tokenDetails["wrapperAddresses"]
#
#             recipeDetails[f"chain{num}"]["gas"] = {}
#             recipeDetails[f"chain{num}"]["gas"]["address"] = recipeDetails[f"chain{num}"]["chain"]["gas"]
#             recipeDetails[f"chain{num}"]["gas"]["symbol"] = recipeDetails[f"chain{num}"]["chain"]["symbol"]
#             # recipeDetails[f"chain{num}"]["gas"]["price"] = Dex.getGasPrice(recipeDetails[f"chain{num}"]["chain"]["name"], recipeDetails[f"chain{num}"]["chain"]["pair"])
#
#             recipeDetails[f"chain{num}"]["stablecoin"]["price"] = \
#                 Dex.getTokenPriceByDexId(
#                     chainName=recipeDetails[f"chain{num}"]["chain"]["name"],
#                     tokenAddress=recipeDetails[f"chain{num}"]["stablecoin"]["address"],
#                     dexId=recipeDetails["data"]["dexId"]
#                 )
#
#             if recipeDetails[f"chain{num}"]["stablecoin"]["price"] is None:
#                 recipeDetails[f"chain{num}"]["stablecoin"]["price"] = 1.0
#
#             del recipeDetails[f"chain{num}"]["chain"]["symbol"], recipeDetails[f"chain{num}"]["chain"]["gas"], recipeDetails[f"chain{num}"]["chain"]["pair"]
#
#     return recipes
#
# def addFee(recipe, fee, section):
#
#     if "fees" not in recipe["status"]:
#         recipe["status"]["fees"] = {}
#
#     if "total" not in recipe["status"]["fees"]:
#         recipe["status"]["fees"]["total"] = 0
#
#     if section not in recipe["status"]["fees"]:
#         recipe["status"]["fees"][section] = {}
#
#     recipe["status"]["fees"][section]["subTotal"] = 0
#
#     if type(fee) is dict:
#         for title, value in fee.items():
#             recipe["status"]["fees"][section][title] = value
#         for k, v in recipe["status"]["fees"][section].items():
#             if k != "subTotal":
#                 recipe["status"]["fees"][section]["subTotal"] = recipe["status"]["fees"][section]["subTotal"] + v
#     elif type(fee) is int or type(fee) is float:
#         feeName = f'{section}_{len(recipe["status"]["fees"][section])}'
#         recipe["status"]["fees"][section][feeName] = fee
#         x = 1
#         for k, v in recipe["status"]["fees"][section].items():
#             if k != "subTotal":
#                 recipe["status"]["fees"][section]["subTotal"] = recipe["status"]["fees"][section]["subTotal"] + v
#     else:
#         errMsg = f'Invalid fee: {fee}'
#         logger.error(errMsg)
#         sys.exit(errMsg)
#
#     recipe["status"]["fees"]["total"] = 0
#
#     for key, value in recipe["status"]["fees"].items():
#         if key != "total":
#             for feeName, feeAmount in value.items():
#                 if feeName == "subTotal":
#                     recipe["status"]["fees"]["total"] = recipe["status"]["fees"]["total"] + feeAmount
#
#     return recipe