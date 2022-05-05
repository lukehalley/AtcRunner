import os
import sys
import time
import re
from dotenv import load_dotenv
from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time
from pyvirtualdisplay import Display
import logging
from itertools import repeat

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

def openBridgeTab(driver, url):

    tabs = getCurrentOpenTabs(driver)

    bridgeAlreadyOpen = "bridge" in tabs.keys()

    if bridgeAlreadyOpen:
        logger.info("Switching to Bridge tab...")
        switchToTab(driver, "bridge")
        driver.get(url)
    else:
        logger.info("Opening Bridge tab...")
        openURLInNewTab(driver, url)
        switchToTab(driver, "bridge")

    logger.info("Bridge opened!")

def metamaskApproveTransaction(driver, approveBtn):
    approveBtn.click()
    switchToTab(driver, "metamask")
    currentTransactionQueue = int(findWebElement(driver, os.environ.get("METAMASK_TRANSACTIONS_QUEUE")).text.split("(")[1].replace(")", ""))
    x = 1

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

def clearTransactions(driver):
    switchToTab(driver, "metamask")

    try:
        pendingTransactions = findWebElement(driver, os.environ.get("METAMASK_PENDING_TRANSACTIONS"), timeout=5)
        totalPendingTransactions = int(pendingTransactions.text.split("of ")[1])
    except:
        totalPendingTransactions = 1
        pass

    logger.info(f"Clearing Metamask stale transactions...")

    for _ in repeat(None, totalPendingTransactions):
        rejectButton = findWebElement(driver, os.environ.get("METAMASK_REJECT_BUTTON"))
        rejectButton.click()

    logger.info(f"Cleared {totalPendingTransactions} Metamask stale transactions!")

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

    try:
        findWebElement(driver, os.environ.get("METAMASK_REJECT_BUTTON"), timeout=5)
        clearTransactions(driver)
    except:
        pass

    logger.info("Checking if logged in...")
    findWebElement(driver, os.environ.get("METAMASK_TABS"))
    logger.info("Metamask logged in!")

def checkBridgeStatus(driver, bridgeBtn, bridgeBtnText):

    bridgeAvailable = False

    bridgeBtnText = "Approve"

    if bridgeBtnText == "Insufficient JEWEL Balance":
        bridgeAvailable = False
    elif "Approve" in bridgeBtnText:
        metamaskApproveTransaction(driver, bridgeBtn)
        bridgeAvailable = True
    elif bridgeBtnText == "Bridge Token":
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

        Utils.printSeperator()
        logger.info(f"[ARB #{arbitrageOrigin['roundTripCount']}] Switching Network For Bridge")
        Utils.printSeperator()

        switchMetamaskNetwork(driver, networks[i]["chain"])

        if i <= 0:
            outputChainID = networks[1]["networkDetails"]["chainID"]

            Utils.printSeperator()
            logger.info(f"[ARB #{arbitrageOrigin['roundTripCount']}] Calculating Bridge Fees For Arbitrage Origin to Arbitrage Destination")
            Utils.printSeperator()
        else:
            outputChainID = networks[0]["networkDetails"]["chainID"]

            Utils.printSeperator()
            logger.info(f"[ARB #{arbitrageOrigin['roundTripCount']}] Calculating Bridge Fees For Arbitrage Destination to Arbitrage Origin")
            Utils.printSeperator()

        logger.info("Building Synapse Bridge URL...")
        synapseBridgeBridgeURL = buildBridgeURL(networks[i]["bridgeToken"], networks[1]["bridgeToken"],
                                                outputChainID)
        logger.info(f"Synapse Bridge URL built: {synapseBridgeBridgeURL}")

        logger.info("Opening Synapse Bridge...")
        openBridgeTab(driver, synapseBridgeBridgeURL)
        logger.info("Synapse Bridge opened!")

        logger.info(f"Checking current {networks[i]['bridgeToken']} GUI balance...")
        synapseCurrentTokenBalance = findWebElement(driver, os.environ.get("SYNAPSE_GUIBALANCE"))
        synapseGUIBalance = synapseCurrentTokenBalance.text
        logger.info(f"{networks[i]['bridgeToken']} GUI balance is currently {synapseGUIBalance}")

        logger.info("Waiting for Synapse input field...")
        inputTokenField = findWebElement(driver, os.environ.get("SYNAPSE_INPUTFIELD"))
        logger.info("Synapse input field located!")

        logger.info(f"Entering {amountToBridge} {networks[i]['bridgeToken']} as the input token...")
        inputTokenField.send_keys(str(amountToBridge))
        logger.info("Entered input tokens!")

        outputFieldClass = findWebElement(driver, os.environ.get("SYNAPSE_OUTPUTFIELD_COLOR_XPATH"), selectorMode=False).get_attribute("class")
        outputFieldColor = "bg-" + re.search('bg-(.*)\n', outputFieldClass).group(1)
        outputField = os.environ.get("SYNAPSE_OUTPUTFIELD").replace("<OUTPUT-COLOR>", outputFieldColor)

        logger.info("Waiting for Synapse output field...")
        outputTokenField = findWebElement(driver, outputField)
        logger.info("Synapse output field located!")

        totalReceiveAmount = outputTokenField.get_attribute('value')

        while totalReceiveAmount == '':
            totalReceiveAmount = outputTokenField.get_attribute('value')

        totalReceiveAmount = float(totalReceiveAmount)

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

        logger.info(f"After bridge we will receive {totalReceiveAmount} {networks[1]['bridgeToken']}")

        if i <= 0:
            objectTitle = "arbitrageOrigin"
            bridgePlan[objectTitle] = \
                {
                    "network": arbitrageOrigin,
                    "amountSent": amountToBridge,
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
                    "amountExpectedToReceive": totalReceiveAmount,
                    "bridgeFee": round(bridgeFee, 6),
                    "bridgeToken": networks[i]['bridgeToken'],
                    "bridgeFeePercentage": bridgeFeePercentage,
                    "bridgeSlippage": bridgeSlippage,
                    "bridgeURL": synapseBridgeBridgeURL
                }

        i = i + 1

        Utils.printSeperator(True)

    Utils.printSeperator()
    logger.info(f"[ARB #{arbitrageOrigin['roundTripCount']}] Bridge Fees Calculated")
    Utils.printSeperator()

    feeAmount = bridgePlan["arbitrageOrigin"]["bridgeFee"] + bridgePlan["arbitrageDestination"]["bridgeFee"]
    tokenLoss = abs(bridgePlan["arbitrageDestination"]["amountExpectedToReceive"] - bridgePlan["arbitrageOrigin"]["amountSent"])

    bridgePlan["totals"] = {
        "bridgeToken": bridgePlan['arbitrageOrigin']['bridgeToken'],
        "bridgeTotalTokenLoss": tokenLoss,
        "bridgeTotalFee": round(feeAmount, 6),
        "bridgeTotalFeePercentage": bridgePlan["arbitrageOrigin"]["bridgeFeePercentage"] + bridgePlan["arbitrageDestination"]["bridgeFeePercentage"],
        "bridgeTotalSlippage": bridgePlan["arbitrageOrigin"]["bridgeSlippage"] + bridgePlan["arbitrageDestination"]["bridgeSlippage"]
    }

    logger.info(f"Bridge Total Fee: {bridgePlan['totals']['bridgeTotalFee']} {bridgePlan['totals']['bridgeToken']}")
    logger.info(f"Bridge Total % Fee: {bridgePlan['totals']['bridgeTotalFeePercentage']}%")
    logger.info(f"Bridge Total % Slippage: {bridgePlan['totals']['bridgeTotalSlippage']}%")

    Utils.printSeperator()
    logger.info(f"[ARB #{arbitrageOrigin['roundTripCount']}] Switching Back To Origin Network To Execute Bridge")
    Utils.printSeperator()

    switchMetamaskNetwork(driver, networks[0]["chain"])

    return bridgePlan

def executeBridge(driver, direction, bridgePlan, amountToBridge):

    bridgeObject = bridgePlan[direction]

    logger.info("Opening Synapse Bridge...")
    openBridgeTab(driver, bridgeObject["bridgeURL"])
    logger.info("Synapse Bridge opened!")

    logger.info("Waiting for Synapse input field...")
    inputTokenField = findWebElement(driver, os.environ.get("SYNAPSE_INPUTFIELD"))
    logger.info("Synapse input field located!")

    logger.info(f"Entering {amountToBridge} {bridgeObject['bridgeToken']} as the input token...")
    inputTokenField.send_keys(str(amountToBridge))
    logger.info("Entered input tokens!")

    outputFieldClass = findWebElement(driver, os.environ.get("SYNAPSE_OUTPUTFIELD_COLOR_XPATH"),
                                      selectorMode=False).get_attribute("class")
    outputFieldColor = "bg-" + re.search('bg-(.*)\n', outputFieldClass).group(1)
    outputField = os.environ.get("SYNAPSE_OUTPUTFIELD").replace("<OUTPUT-COLOR>", outputFieldColor)

    logger.info("Waiting for Synapse output field...")
    outputTokenField = findWebElement(driver, outputField)
    logger.info("Synapse output field located!")

    totalReceiveAmount = outputTokenField.get_attribute('value')

    while totalReceiveAmount == '':
        totalReceiveAmount = outputTokenField.get_attribute('value')

    totalReceiveAmount = float(totalReceiveAmount)

    bridgeBtn = findWebElement(driver, os.environ.get("SYNAPSE_BRIDGE_BTN_TXT"))
    bridgeStatus = bridgeBtn.text

    bridgeStatus = checkBridgeStatus(driver, bridgeBtn, bridgeStatus)

    return 0
    

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
        Utils.printSeperator(True)
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

        Utils.printSeperator(True)
