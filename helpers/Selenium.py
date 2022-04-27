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

import helpers.Utils as Utils

logger = logging.getLogger("DFK-DEX")


def initBrowser():
    logger.info("Initialising Selenium")

    isDocker = Utils.checkIsDocker()

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

def approveToken(driver):
    print("I am aproooving!")

def checkBridgeStatus(driver, text):

    bridgeAvailable = False

    if text == "Insufficient JEWEL Balance":
        bridgeAvailable = False
    elif "Approve" in text:
        approveToken(driver)
        bridgeAvailable = True
    elif text == "Bridge Token":
        bridgeAvailable = True

    return bridgeAvailable

def buildBridgeURL(inputToken, outputToken, chainId):
    synapseBridgeURL = os.environ.get("SYNAPSE_BRIDGE_URL")

    synapseBridgeURL = synapseBridgeURL.replace("<INPUT_TOKEN>", inputToken)
    synapseBridgeURL = synapseBridgeURL.replace("<OUTPUT_TOKEN>", outputToken)
    synapseBridgeURL = synapseBridgeURL.replace("<OUTPUT_CHAIN_ID>", chainId)

    return synapseBridgeURL

def calculateSynapseBridgeFees(driver, arbitrageOrigin, arbitrageDestination, amountToBridge):
    i = 0

    bridgePlan = {}

    networks = [arbitrageOrigin, arbitrageDestination]

    while i < 2:

        switchMetamaskNetwork(driver, networks[i]["chain"])

        if i <= 0:
            outputChainID = networks[1]["networkDetails"]["chainID"]
        else:
            outputChainID = networks[0]["networkDetails"]["chainID"]

        logger.info("Building Synapse Bridge URL...")
        synapseBridgeBridgeURL = buildBridgeURL(networks[i]["bridgeToken"], networks[1]["bridgeToken"],
                                                outputChainID)
        logger.info(f"Synapse Bridge URL built: {synapseBridgeBridgeURL}")

        logger.info("Opening Synapse Bridge...")
        driver.get(synapseBridgeBridgeURL)
        logger.info("Synapse Bridge opened!")

        logger.info(f"Checking current {networks[i]['bridgeToken']} GUI balance...")
        synapseCurrentTokenBalance = findWebElement(driver, os.environ.get("SYNAPSE_GUIBALANCE"))
        synapseGUIBalance = synapseCurrentTokenBalance.text
        logger.info(f"{networks[i]['bridgeToken']} GUI balance is currently {synapseGUIBalance}")

        logger.info("Waiting for Synapse input field...")
        inputTokenField = findWebElement(driver, os.environ.get("SYNAPSE_INPUTFIELD"))
        logger.info("Synapse input field located!")

        logger.info(f"Entering {amountToBridge} {networks[i]['bridgeToken']} as the input token...")
        inputTokenField.send_keys(amountToBridge)
        logger.info("Entered input tokens!")

        time.sleep(5)

        logger.info(f"Checking {networks[i]['bridgeToken']} bridge fee...")
        synapseFee = findWebElement(driver, os.environ.get("SYNAPSE_FEE"))
        bridgeFee = float(synapseFee.text)
        bridgeFeePercentage = Utils.percentageOf(bridgeFee, amountToBridge)
        logger.info(f"Bridge fee is {bridgeFee} {networks[i]['bridgeToken']} ({bridgeFeePercentage}%)")

        logger.info(f"Checking bridge slippage fee...")
        synapseSlippage = findWebElement(driver, os.environ.get("SYNAPSE_SLIPPAGE"))
        synapseSlippageText = synapseSlippage.text
        bridgeSlippage = float((synapseSlippageText).replace("%", ""))

        if "-" in synapseSlippageText:
            logger.info(f"Bridge has a negative slippage of {bridgeSlippage}%")
        else:
            logger.info(f"Bridge has a positive slippage of {bridgeSlippage}%")

        totalReceiveAmount = float(amountToBridge) - bridgeFee
        logger.info(f"After bridge we will receive {totalReceiveAmount} {networks[1]['bridgeToken']}")

        time.sleep(5)

        if i <= 0:
            objectTitle = "arbitrageOrigin"
            bridgePlan[objectTitle] = \
                {
                    "network": arbitrageOrigin,
                    "bridgeFee": round(bridgeFee, 6),
                    "bridgeToken": networks[i]['bridgeToken'],
                    "bridgeFeePercentage": bridgeFeePercentage,
                    "bridgeSlippage": bridgeSlippage,
                    "bridgeURL": synapseBridgeBridgeURL
                }
        else:
            objectTitle = "arbitrageDestination"
            bridgePlan[objectTitle] = \
                {
                    "network": arbitrageDestination,
                    "bridgeFee": round(bridgeFee, 6),
                    "bridgeToken": networks[i]['bridgeToken'],
                    "bridgeFeePercentage": bridgeFeePercentage,
                    "bridgeSlippage": bridgeSlippage,
                    "bridgeURL": synapseBridgeBridgeURL
                }

        i = i + 1

    feeAmount = bridgePlan["arbitrageOrigin"]["bridgeFee"] + bridgePlan["arbitrageDestination"]["bridgeFee"]

    bridgePlan["totals"] = {
        "bridgeToken": bridgePlan['arbitrageOrigin']['bridgeToken'],
        "bridgeTotalFee": round(feeAmount, 6),
        "bridgeTotalFeePercentage": bridgePlan["arbitrageOrigin"]["bridgeFeePercentage"] + bridgePlan["arbitrageDestination"]["bridgeFeePercentage"],
        "bridgeTotalSlippage": bridgePlan["arbitrageOrigin"]["bridgeSlippage"] + bridgePlan["arbitrageDestination"]["bridgeSlippage"]
    }

    Utils.printSeperator(True)

    logger.info(f"Bridge Total Fee: {bridgePlan['totals']['bridgeTotalFee']} {bridgePlan['totals']['bridgeToken']}")
    logger.info(f"Bridge Total % Fee: {bridgePlan['totals']['bridgeTotalFeePercentage']}%")
    logger.info(f"Bridge Total % Slippage: {bridgePlan['totals']['bridgeTotalSlippage']}%")

    switchMetamaskNetwork(driver, networks[0]["chain"])

    return bridgePlan

def executeBridge(driver, direction, bridgePlan, amountToBridge):

    bridgeObject = bridgePlan[direction]

    logger.info("Opening Synapse Bridge...")
    driver.get(bridgeObject["bridgeURL"])
    logger.info("Synapse Bridge opened!")

    logger.info("Waiting for Synapse input field...")
    inputTokenField = findWebElement(driver, os.environ.get("SYNAPSE_INPUTFIELD"))
    logger.info("Synapse input field located!")

    logger.info(f"Entering {amountToBridge} {bridgeObject['bridgeToken']} as the input token...")
    inputTokenField.send_keys(amountToBridge)
    logger.info("Entered input tokens!")

    time.sleep(5)

    bridgeBtn = findWebElement(driver, os.environ.get("SYNAPSE_BRIDGE_BTN_TXT"))
    bridgeStatus = bridgeBtn.text

    bridgeStatus = checkBridgeStatus(driver, bridgeStatus)

    return 0
    

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
