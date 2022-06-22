import logging, os

from pyvirtualdisplay import Display
from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.keys import Keys

from src.utils.general import checkIsDocker
from src.web.automation import findWebElement, safeClick, selectTokenInDex, getRouteForSwap
from src.web.tabs import openURL, getCurrentTabCount, switchToTabByIndex, closeLastTab
from src.web.general import getMetamaskURL

logger = logging.getLogger("DFK-DEX")

def initBrowser(killChrome=True):

    if killChrome:
        os.system("ps aux | grep chrome | awk ' { print $2 } ' | xargs kill -9 > /dev/null 2>&1")

    logger.debug("Initialising Selenium")

    isDocker = checkIsDocker()

    if isDocker:
        logger.debug("Starting Virtual Display since we are running in Docker")
        display = Display(visible=False, size=(1920, 1080))
        display.start()
        logger.debug("Virtual Display started")

    chrome_options = webdriver.ChromeOptions()

    if isDocker:
        chrome_options.add_argument(f"user-data-dir=/home/arb-bot/lib/chrome")
    else:
        chrome_options.add_argument(f"user-data-dir=/Users/luke/Documents/chrome")

    chrome_options.add_argument("profile-directory=Profile 6")
    chrome_options.add_argument("--start-maximized")

    if isDocker:
        driver = webdriver.Chrome(executable_path='/usr/bin/chromedriver', options=chrome_options)
    else:
        driver = webdriver.Chrome(executable_path='/usr/local/bin/chromedriver', options=chrome_options)

    logger.debug("Selenium initialised & ready")

    loginIntoMetamask(driver=driver)

    return driver

def loginIntoMetamask(driver):

    metamaskUrl = getMetamaskURL()

    openURL(driver=driver, url=metamaskUrl, newTab=False)

    logger.debug("Waiting for Metamask password input...")
    passwordInput = None
    while not passwordInput:
        try:
            passwordInput = findWebElement(driver, os.environ.get("METAMASK_PASSWORD_INPUT"))
        except NoSuchElementException:
            pass

    logger.debug("Password input located!")

    logger.debug("Filling in password...")
    mmPassword = os.environ.get("KNOCKKNOCK")
    passwordInput.send_keys(mmPassword)
    logger.debug("Password inputted!")

    logger.debug("Pressing enter...")
    passwordInput.send_keys(Keys.RETURN)
    logger.debug("Enter key pressed!")

    logger.debug("Checking if logged in...")
    findWebElement(driver, os.environ.get("METAMASK_TABS"))
    logger.debug("Metamask logged in!")

def switchMetamaskNetwork(driver, networkToSwitchTo):

    switchToTabByIndex(driver=driver, index=0)

    logger.debug("Locating Metamask switch dropdown...")
    switchDropdown = findWebElement(driver, os.environ.get("METAMASK_SWITCH_DROPDOWN"))
    logger.debug("Metamask switch dropdown located!")

    logger.debug("Getting current network...")
    mmCurrentNetwork = findWebElement(driver, os.environ.get("METAMASK_CURRENT_NETWORK"))
    currentNetwork = mmCurrentNetwork.text
    logger.debug(f"Got current network: {currentNetwork}")

    if (currentNetwork == networkToSwitchTo):
        logger.debug(f"We are already on {networkToSwitchTo} - no need to switch!")
        return
    else:
        logger.debug("Clicking Metamask switch dropdown...")
        switchDropdown.click()
        logger.debug("Metamask switch dropdown Clicked!")

        logger.debug("Checking dropdown is open...")
        findWebElement(driver, os.environ.get("METAMASK_ADD_NETWORK_BUTTON"))
        logger.debug("Metamask switch dropdown is open!")

        logger.debug("Getting network list element...")
        findWebElement(driver, os.environ.get("METAMASK_NETWORK_LIST"))
        logger.debug("Got network list element!")

        logger.debug(f"Switching to {networkToSwitchTo}...")
        networkListItem = driver.find_element_by_xpath(f"//span[text()='{networkToSwitchTo}']")
        networkListItem.click()
        logger.debug(f"Switched to {networkToSwitchTo}!")

def closeBrowser(driver, display):
    logger.debug("Shutting down Selenium")

    if display:
        logger.debug("Shutting down display since were running in Docker")
        display.stop()
        logger.debug("Display shut down")

    driver.quit()

    logger.debug("Selenium shutdown")

def getRoutesFromFrontend(driver, network, dexURL, amountToSwap, tokenSymbolIn, tokenSymbolOut):

    switchMetamaskNetwork(driver=driver, networkToSwitchTo=network)

    tabCount = getCurrentTabCount(driver=driver)

    if tabCount <= 1:
        openURL(driver=driver, url=dexURL, newTab=True)

    safeClick(driver=driver, xpath=f"//*[text()='Trader']")

    selectTokenInDex(driver=driver, direction="input", tokenSymbol=tokenSymbolIn)

    selectTokenInDex(driver=driver, direction="output", tokenSymbol=tokenSymbolOut)

    routes = getRouteForSwap(driver=driver, direction="input", amount=amountToSwap)

    closeLastTab(driver=driver)

    return routes