import os, sys, re, time, logging
from dotenv import load_dotenv

from selenium.common.exceptions import NoSuchElementException
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
    logger.info("Initialising Selenium")

    isDocker = checkIsDocker()

    if isDocker:
        logger.info("Starting Virtual Display since we are running in Docker")
        display = Display(visible=False, size=(1920, 1080))
        display.start()
        logger.info("Virtual Display started")
    else:
        display = None

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

    logger.info("Selenium initialised & ready")

    return driver, display

def loginIntoMetamask(driver):
    load_dotenv()

    openMetamaskTab(driver)

    logger.info("Waiting for Metamask password input...")
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

    logger.info("Password input located!")

    logger.info("Filling in password...")
    mmPassword = os.environ.get("KNOCKKNOCK")
    passwordInput.send_keys(mmPassword)
    logger.info("Password inputted!")

    logger.info("Pressing enter...")
    passwordInput.send_keys(Keys.RETURN)
    logger.info("Enter key pressed!")

    logger.info("Checking if logged in...")
    findWebElement(driver, os.environ.get("METAMASK_TABS"))
    logger.info("Metamask logged in!")

def typeToField(element, text):
    element.send_keys(text)

def searchDexForToken(driver, direction, tokenSymbol):

    tokenSelectBtn = os.environ.get("DEX_TOKEN_SELECTOR_BUTTON").replace("[DIRECTION]", direction)

    field = findWebElement(driver=driver,
                                elementString=tokenSelectBtn,
                                selectorMode=True)

    field.click()

    tokenAddressInput = findWebElement(driver=driver, elementString=os.environ.get("DEX_TOKEN_SEARCH"), selectorMode=True)

    typeToField(tokenAddressInput, tokenSymbol)

    isLoading = driver.find_elements_by_class_name(os.environ.get("DEX_LOADING_SPINNER_CLASS"))

    while isLoading:
        isLoading = driver.find_elements_by_class_name(os.environ.get("DEX_LOADING_SPINNER_CLASS"))

    firstResult = findWebElement(driver=driver,
                                 elementString=os.environ.get("DEX_TOKEN_FIRST_RESULT"),
                                 selectorMode=False)

    firstResult.click()
    

def closeBrowser(driver, display):
    logger.info("Shutting down Selenium")

    if display:
        logger.info("Shutting down display since were running in Docker")
        display.stop()
        logger.info("Display shut down")

    driver.quit()

    logger.info("Selenium shutdown")

def findWebElement(driver, elementString, timeout=30, selectorMode=True):
    if selectorMode:
        return WebDriverWait(driver, timeout).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, elementString))
        )
    else:
        return WebDriverWait(driver, timeout).until(
            EC.visibility_of_element_located((By.XPATH, elementString))
        )

def openMetamaskTab(driver):
    load_dotenv()

    tabs = getCurrentOpenTabs(driver)

    metamaskAlreadyOpen = "metamask" in tabs.keys()

    if metamaskAlreadyOpen:
        logger.info("Switching to Metamask tab...")
        switchToTab(driver, "metamask")
    else:
        logger.info("Opening Metamask tab...")
        mmExtString = os.environ.get("MM_EXT_STR")
        mmURL = f'chrome-extension://{mmExtString}/home.html'

        driver.get(mmURL)

    logger.info("Metamask opened!")

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

    logger.info("Locating Metamask switch dropdown...")
    switchDropdown = findWebElement(driver, os.environ.get("METAMASK_SWITCH_DROPDOWN"))
    logger.info("Metamask switch dropdown located!")

    logger.info("Getting current network...")
    mmCurrentNetwork = findWebElement(driver, os.environ.get("METAMASK_CURRENT_NETWORK"))
    currentNetwork = mmCurrentNetwork.text
    logger.info(f"Got current network: {currentNetwork}")

    if (currentNetwork == networkToSwitchTo):
        logger.info(f"We are already on {networkToSwitchTo} - no need to switch!")
        printSeperator(True)
        return
    else:
        logger.info("Clicking Metamask switch dropdown...")
        switchDropdown.click()
        logger.info("Metamask switch dropdown Clicked!")

        logger.info("Checking dropdown is open...")
        findWebElement(driver, os.environ.get("METAMASK_ADD_NETWORK_BUTTON"))
        logger.info("Metamask switch dropdown is open!")

        logger.info("Getting network list element...")
        findWebElement(driver, os.environ.get("METAMASK_NETWORK_LIST"))
        logger.info("Got network list element!")

        logger.info(f"Switching to {networkToSwitchTo}...")
        networkListItem = driver.find_element_by_xpath(f"//span[text()='{networkToSwitchTo}']")
        networkListItem.click()
        logger.info(f"Switched to {networkToSwitchTo}!")

        printSeperator(True)
