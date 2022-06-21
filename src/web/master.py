from src.web.actions import initBrowser, loginIntoMetamask, getRoutesFromFrontend
from dotenv import load_dotenv

load_dotenv()

driver = initBrowser()

loginIntoMetamask(driver=driver)

while True:

    routes1 = getRoutesFromFrontend(
        driver=driver,
        network="harmony",
        dexURL="https://game.defikingdoms.com/#/marketplace/central",
        amountToSwap=1000,
        tokenSymbolIn="1USDC",
        tokenSymbolOut="JEWEL"
    )

    print(routes1)

    routes2 = getRoutesFromFrontend(
        driver=driver,
        network="avalanchedfk",
        dexURL="https://game.defikingdoms.com/#/marketplace",
        amountToSwap=1000,
        tokenSymbolIn="USDC",
        tokenSymbolOut="JEWEL"
    )

    print(routes2)