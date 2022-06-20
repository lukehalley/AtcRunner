import os, sys, re, time, logging
from dotenv import load_dotenv

from selenium.common.exceptions import NoSuchElementException, StaleElementReferenceException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium import webdriver

from pyvirtualdisplay import Display
from itertools import repeat

from src.utils.general import printSeperator, checkIsDocker, getCurrentDateTime, percentageOf

logger = logging.getLogger("DFK-DEX")


def initBrowser():
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

    return driver


def loginIntoMetamask(driver):
    load_dotenv()

    openMetamaskTab(driver)

    logger.debug("Waiting for Metamask password input...")
    passwordInput = None
    fails = 0
    while not passwordInput and fails < 6:
        try:
            passwordInput = findWebElement(driver, os.environ.get("METAMASK_PASSWORD_INPUT"))
        except NoSuchElementException:
            fails = fails + 1
            time.sleep(2)
            openMetamaskTab(driver)

    if fails >= 6:
        sys.exit("Couldn't log into Metamask!")

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


def typeToField(element, text):
    element.send_keys(text)


def findElementByText(driver, text):
    return findWebElement(driver=driver, elementString=f"//*[text()='{text}']", selectorMode=False)


def waitForDexToLoad(driver):
    isLoading = driver.find_elements_by_class_name(os.environ.get("DEX_LOADING_SPINNER_CLASS"))

    while isLoading:
        isLoading = driver.find_elements_by_class_name(os.environ.get("DEX_LOADING_SPINNER_CLASS"))


def selectTokenInDex(driver, direction, tokenSymbol):

    directionTokenSelectBtnSelector = os.environ.get("DEX_TOKEN_SELECTOR_BUTTON").replace("[DIRECTION]", direction)

    directionTokenSelectBtn = findWebElement(driver=driver,
                           elementString=directionTokenSelectBtnSelector,
                           selectorMode=True)

    if directionTokenSelectBtn.text != tokenSymbol:
        directionTokenSelectBtn.click()

        tokenAddressInput = findWebElement(driver=driver, elementString=os.environ.get("DEX_TOKEN_SEARCH"),
                                           selectorMode=True)

        typeToField(tokenAddressInput, tokenSymbol)

        symbolText = ""
        while symbolText != tokenSymbol:
            try:
                symbolText = findWebElement(driver=driver,
                                            elementString=os.environ.get("DEX_TOKEN_FIRST_RESULT_SYMBOL"),
                                            selectorMode=False).text
            except StaleElementReferenceException:
                pass



        safeClick(driver=driver, xpath=os.environ.get("DEX_TOKEN_FIRST_RESULT"))


def getRouteForSwap(driver, direction, amount):
    oppositeDirection = getOppositeDirection(direction)

    directionSelector = os.environ.get("DEX_TOKEN_INPUT_AMOUNT").replace("[DIRECTION]", direction)
    oppositeDirectionSelector = os.environ.get("DEX_TOKEN_INPUT_AMOUNT").replace("[DIRECTION]", oppositeDirection)

    directionField = findWebElement(driver=driver,
                           elementString=directionSelector,
                           selectorMode=True)

    typeToField(directionField, str(amount))

    oppositeField = findWebElement(driver=driver,
                           elementString=oppositeDirectionSelector,
                           selectorMode=True)

    tradeIsReady = oppositeField.get_attribute("value") != ""
    while not tradeIsReady:
        tradeIsReady = oppositeField.get_attribute("value") != ""

    routeSelector = "/html/body/div[2]/div[1]/section/div/div[4]/div/div[2]/div"

    try:
        routes = findWebElement(driver=driver,
                               elementString=routeSelector,
                               selectorMode=False, timeout=3).text.split("\n")
    except:
        routes = []
        pass

    return routes


def safeClick(driver, xpath):
    staleElement = True
    while staleElement:
        try:
            element = WebDriverWait(driver, timeout=0).until(EC.element_to_be_clickable((By.XPATH, xpath)))
            element.click()
            staleElement = False
        except StaleElementReferenceException:
            staleElement = True

def getOppositeDirection(direction):
    if direction == "input":
        return "output"
    else:
        return "input"



def closeBrowser(driver, display):
    logger.debug("Shutting down Selenium")

    if display:
        logger.debug("Shutting down display since were running in Docker")
        display.stop()
        logger.debug("Display shut down")

    driver.quit()

    logger.debug("Selenium shutdown")


def findWebElement(driver, elementString, timeout=30, selectorMode=True):
    ignoredExceptions = (NoSuchElementException, StaleElementReferenceException)
    if selectorMode:
        return WebDriverWait(driver, timeout, ignored_exceptions=ignoredExceptions).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, elementString))
        )
    else:
        return WebDriverWait(driver, timeout, ignored_exceptions=ignoredExceptions).until(
            EC.visibility_of_element_located((By.XPATH, elementString))
        )

    # ignoredExceptions = (NoSuchElementException, StaleElementReferenceException)
    #
    # while True:
    #     try:
    #         if selectorMode:
    #             return WebDriverWait(driver, timeout, ignored_exceptions=ignoredExceptions).until(
    #                 EC.visibility_of_element_located((By.CSS_SELECTOR, elementString))
    #             )
    #         else:
    #             return WebDriverWait(driver, timeout, ignored_exceptions=ignoredExceptions).until(
    #                 EC.visibility_of_element_located((By.XPATH, elementString))
    #             )
    #     except StaleElementReferenceException:
    #         pass



def findClassInWebElement(element, className):
    staleElement = True
    while staleElement:
        try:
            return element.find_element_by_class_name(className)
        except StaleElementReferenceException:
            print("waiting")
            staleElement = True



def openMetamaskTab(driver):
    load_dotenv()

    tabs = getCurrentOpenTabs(driver)

    metamaskAlreadyOpen = "metamask" in tabs.keys()

    if metamaskAlreadyOpen:
        logger.debug("Switching to Metamask tab...")
        switchToTab(driver, "metamask")
    else:
        logger.debug("Opening Metamask tab...")
        mmExtString = os.environ.get("MM_EXT_STR")
        mmURL = f'chrome-extension://{mmExtString}/home.html'

        driver.get(mmURL)

    logger.debug("Metamask opened!")


def openURLInNewTab(driver, url):
    driver.execute_script(f'''window.open("{url}","_blank");''')


def getCurrentOpenTabs(driver):
    tabs = {}
    x = 0
    for handle in driver.window_handles:
        driver.switch_to.window(handle)

        tabURL = driver.current_url

        if "chrome-extension://" in tabURL:
            title = "metamask"
        elif "https://synapseprotocol.com/" in tabURL:
            title = "bridge"
        else:
            title = "unknown"

        if title not in tabs:
            tabs[title] = {"tabNumber": x, "tabURL": tabURL}

        x = x + 1

    return tabs


def closeMetamaskPopup(driver):
    driver.switch_to_window(driver.window_handles[-1])
    driver.close()


def closeAllTabsExceptFirst(driver):
    currentTabs = getCurrentOpenTabs(driver)
    if len(currentTabs) > 1:
        keys = list(currentTabs.keys())
        keys.pop(0)
        for key in keys:
            driver.switch_to_window(driver.window_handles[currentTabs[key]["tabNumber"]])
            driver.close()


def switchToTab(driver, tab):
    currentTabs = getCurrentOpenTabs(driver)
    if len(currentTabs) > 1:
        desiredTab = currentTabs[tab]
        driver.switch_to_window(driver.window_handles[desiredTab["tabNumber"]])


def switchMetamaskNetwork(driver, networkToSwitchTo):
    openMetamaskTab(driver)

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
