from src.utils.frontend import findElementByText, selectTokenInDex, getRouteForSwap, switchMetamaskNetwork

# TODO: Make this compatible with other Dex's UI - clicking the trader is a DFK thing.
def getRoutesFromFrontend(driver, network, dexURL, amountToSwap, tokenSymbolIn, tokenSymbolOut):

    switchMetamaskNetwork(driver=driver, networkToSwitchTo=network)

    driver.get(dexURL)

    trader = findElementByText(driver=driver, text="Trader")

    trader.click()

    selectTokenInDex(driver=driver, direction="input", tokenSymbol=tokenSymbolIn)

    selectTokenInDex(driver=driver, direction="output", tokenSymbol=tokenSymbolOut)

    return getRouteForSwap(driver=driver, direction="input", amount=amountToSwap)