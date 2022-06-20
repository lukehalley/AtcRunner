from src.utils.frontend import loginIntoMetamask, findElementByText, selectTokenInDex, getRouteForSwap

def getRoutesFromFrontend(driver, dexURL, amountToSwap, tokenSymbolIn, tokenSymbolOut):

    loginIntoMetamask(driver=driver)

    driver.get(dexURL)

    # TODO: Make this compatible with other Dex's UI - clicking the trader is a DFK thing.
    trader = findElementByText(driver=driver, text="Trader")

    trader.click()

    selectTokenInDex(driver=driver, direction="input", tokenSymbol=tokenSymbolIn)

    selectTokenInDex(driver=driver, direction="output", tokenSymbol=tokenSymbolOut)

    return getRouteForSwap(driver=driver, direction="input", amount=amountToSwap)