from src.utils.frontend import initBrowser, loginIntoMetamask, findElementByText, selectTokenInDex, switchMetamaskNetwork, safeClick
import time

startingTime = time.perf_counter()

driver, display = initBrowser()

loginIntoMetamask(driver=driver)

while True:

    switchMetamaskNetwork(driver=driver, networkToSwitchTo="harmony")

    driver.get("https://game.defikingdoms.com/#/marketplace/central")

    trader = findElementByText(driver=driver, text="Trader")

    trader.click()

    selectTokenInDex(driver=driver, direction="input", tokenSymbol="JEWEL")

    selectTokenInDex(driver=driver, direction="output", tokenSymbol="1USDC")

    switchMetamaskNetwork(driver=driver, networkToSwitchTo="avalanchedfk")

    driver.get("https://game.defikingdoms.com/#/marketplace/central")

    trader = findElementByText(driver=driver, text="Trader")

    trader.click()

    selectTokenInDex(driver=driver, direction="input", tokenSymbol="JEWEL")

    selectTokenInDex(driver=driver, direction="output", tokenSymbol="USDC")

    endingTime = time.perf_counter()

    print(f"Completed Web Automation In {endingTime - startingTime :0.4f} Seconds")

    x = 1