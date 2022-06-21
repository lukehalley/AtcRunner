from src.utils.frontend import findElementByText, selectTokenInDex, getRouteForSwap, switchMetamaskNetwork, getCurrentOpenTabs, getCurrentTabCount, switchToTab, openURLInNewTab, safeClick, initBrowser
from selenium.common.exceptions import StaleElementReferenceException

# TODO: Make this compatible with other Dex's UI - clicking the trader is a DFK thing.
def getRoutesFromFrontend(driver, network, dexURL, amountToSwap, tokenSymbolIn, tokenSymbolOut):

    # TODO: Open 3 tabs - metamask, arb 1, arb 2 and keep them open.

    tabCount = getCurrentTabCount(driver=driver)
    switchMetamaskNetwork(driver=driver, networkToSwitchTo=network)

    if tabCount <= 1:
        openURLInNewTab(driver=driver, url=dexURL, tabTitle=network)
    else:
        switchToTab(driver=driver, tab="dex")

    safeClick(driver=driver, xpath=f"//*[text()='Trader']")

    selectTokenInDex(driver=driver, direction="input", tokenSymbol=tokenSymbolIn)

    selectTokenInDex(driver=driver, direction="output", tokenSymbol=tokenSymbolOut)

    return getRouteForSwap(driver=driver, direction="input", amount=amountToSwap)

driver = initBrowser()

while True:

    getRoutesFromFrontend(
        driver=driver,
        network="harmony",
        dexURL="https://game.defikingdoms.com/#/marketplace/central",
        amountToSwap=1000,
        tokenSymbolIn="1USDC",
        tokenSymbolOut="JEWEL"
    )

    getRoutesFromFrontend(
        driver=driver,
        network="avalanchedfk",
        dexURL="https://game.defikingdoms.com/#/marketplace",
        amountToSwap=1000,
        tokenSymbolIn="USDC",
        tokenSymbolOut="JEWEL"
    )

x = 1