from src.utils.frontend import initBrowser, loginIntoMetamask, findWebElement, searchDexForToken

driver, display = initBrowser()

loginIntoMetamask(driver=driver)

driver.get("https://game.defikingdoms.com/#/marketplace/central")

trader = findWebElement(driver=driver, elementString="//*[text()='Trader']", selectorMode=False)

trader.click()

searchDexForToken(driver=driver, direction="input", tokenSymbol="JEWEL")

searchDexForToken(driver=driver, direction="output", tokenSymbol="1USDC")

x = 1