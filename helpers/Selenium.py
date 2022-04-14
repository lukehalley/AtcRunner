import os
import time
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time
from pyvirtualdisplay import Display
import logging

logger = logging.getLogger("DFK-DEX")

def checkIsDocker():
    path = '/proc/self/cgroup'
    result = os.path.exists('/.dockerenv') or os.path.isfile(path) and any('docker' in line for line in open(path))
    return (result)

def initBrowser():

    logger.info("Initialising Selenium")

    isDocker = checkIsDocker()

    if isDocker:
        logger.info("Starting Virtual Display since we are running in Docker")
        display = Display(visible=0, size=(1920, 1080))
        display.start()
        logger.info("Virtual Display started")
    else:
        display = None

    chrome_options = webdriver.ChromeOptions()

    if isDocker:
        chrome_options.add_argument(f"user-data-dir=/home/seluser/chrome/")
    else:
        chrome_options.add_argument(f"user-data-dir=/Users/luke/Documents/chrome")

    chrome_options.add_argument("profile-directory=Profile 6")
    chrome_options.add_argument("--start-maximized")

    if isDocker:
        driver = webdriver.Chrome(executable_path='/usr/bin/chromedriver', options=chrome_options)
    else:
        driver = webdriver.Chrome(executable_path='/Users/luke/bin/chromedriver', options=chrome_options)

    logger.info("Selenium initialised & ready")

    return driver, display

def closeBrowser(driver, display):

    logger.info("Shutting down Selenium")

    if display:
        logger.info("Shutting down display since were running in Docker")
        display.stop()
        logger.info("Display shut down")

    driver.quit()

    logger.info("Selenium shutdown")

def findWebElement(driver, selector, timeout=30):
    return WebDriverWait(driver, timeout).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, selector))
    )

def openMetamaskTab(driver):

    load_dotenv()

    logger.info("Opening Metamask tab...")
    mmExtString = os.environ.get("MM_EXT_STR")
    driver.get(f'chrome-extension://{mmExtString}/home.html')
    logger.info("Metamask opened!")

def loginIntoMetamask(driver):

    load_dotenv()

    openMetamaskTab(driver)

    logger.info("Waiting for Metamask password input...")
    passwordInput = findWebElement(driver, os.environ.get("METAMASK_PASSWORDINPUT"))
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

def buildBridgeURL(inputToken, outputToken, chainId):

    synapseBridgeURL = os.environ.get("SYNAPSE_BRIDGE_URL")

    synapseBridgeURL = synapseBridgeURL.replace("<INPUT_TOKEN>", inputToken)
    synapseBridgeURL = synapseBridgeURL.replace("<OUTPUT_TOKEN>", outputToken)
    synapseBridgeURL = synapseBridgeURL.replace("<OUTPUT_CHAIN_ID>", chainId)

    return synapseBridgeURL

def executeSynapseBridge(driver, inputToken, outputToken, chainId, amount):

    logger.info("Building Synapse Bridge URL...")
    synapseBridgeBridgeURL = buildBridgeURL(inputToken, outputToken, chainId)
    logger.info(f"Synapse Bridge URL built: {synapseBridgeBridgeURL}")

    logger.info("Opening Synapse Bridge...")
    driver.get(synapseBridgeBridgeURL)
    logger.info("Synapse Bridge opened!")

    logger.info(f"Checking current {inputToken} GUI balance...")
    synapseCurrentTokenBalance = findWebElement(driver, os.environ.get("SYNAPSE_GUIBALANCE"))
    synapseGUIBalance = synapseCurrentTokenBalance.text
    logger.info(f"{inputToken} GUI balance is currently {synapseGUIBalance}")

    logger.info("Waiting for Synapse input and output token field...")
    inputTokenField = findWebElement(driver, os.environ.get("SYNAPSE_INPUTFIELD"))
    outputTokenField = findWebElement(driver, os.environ.get("SYNAPSE_OUTPUTFIELD"))
    logger.info("Synapse input and output token fields located!")

    logger.info(f"Entering {amount} {inputToken} as the input token...")
    inputTokenField.send_keys(amount)
    logger.info("Entered input tokens!")

    time.sleep(5)

    logger.info(f"Checking how many {inputToken} we will get after bridging...")
    synapseTokenOut = outputTokenField.get_attribute('value')
    logger.info(f"We will get {synapseTokenOut} {inputToken} after we bridge.")

    logger.info(f"Checking {inputToken} bridge fee...")
    synapseFee = findWebElement(driver, os.environ.get("SYNAPSE_FEE"))
    synapseFeeAmount = synapseFee.text
    logger.info(f"Bridge fee is {synapseFeeAmount} {inputToken}")

    logger.info(f"Checking bridge slippage fee...")
    synapseSlippage = findWebElement(driver, os.environ.get("SYNAPSE_SLIPPAGE"))
    synapseSlippageAmount = synapseSlippage.text

    if "-" in synapseSlippageAmount:
        logger.info(f"Bridge has a negative slippage of {synapseSlippageAmount}")
    else:
        logger.info(f"Bridge has a positive slippage of {synapseSlippageAmount}")

    time.sleep(5)

    logger.info(f"Checking bridge button status")
    synapseBridgeBtnText = findWebElement(driver, os.environ.get("SYNAPSE_BRIDGE_BTN_TXT"))
    synapseBridgeStatusText = synapseBridgeBtnText.text
    logger.info(f"Current bridge button status is '{synapseBridgeStatusText}'")

    if synapseBridgeBtnText == "Bridge Token":
        readyToBridge = True
    else:
        readyToBridge = False

    logger.info(f"Ready to bridge: {readyToBridge}")

def switchMetamaskNetwork(driver, networkToSwitchTo):

    openMetamaskTab(driver)

    logger.info("Locating Metamask switch dropdown...")
    switchDropdown = findWebElement(driver, os.environ.get("METAMASK_SWITCHDROPDOWN"))
    logger.info("Metamask switch dropdown located!")

    logger.info("Getting current network...")
    mmCurrentNetwork = findWebElement(driver, os.environ.get("METAMASK_CURRENTNETWORK"))
    currentNetwork = mmCurrentNetwork.text
    logger.info(f"Got current network: {currentNetwork}")

    if (currentNetwork == networkToSwitchTo):
        logger.info(f"We are already on {networkToSwitchTo} - no need to switch!")
        return
    else:
        logger.info("Clicking Metamask switch dropdown...")
        switchDropdown.click()
        logger.info("Metamask switch dropdown Clicked!")

        logger.info("Checking dropdown is open...")
        findWebElement(driver, os.environ.get("METAMASK_ADDNETWORKBUTTON"))
        logger.info("Metamask switch dropdown is open!")

        logger.info("Getting network list element...")
        findWebElement(driver, os.environ.get("METAMASK_NETWORKLIST"))
        logger.info("Got network list element!")

        logger.info(f"Switching to {networkToSwitchTo}...")
        networkListItem = driver.find_element_by_xpath(f"//span[text()='{networkToSwitchTo}']")
        networkListItem.click()
        logger.info(f"Switched to {networkToSwitchTo}!")