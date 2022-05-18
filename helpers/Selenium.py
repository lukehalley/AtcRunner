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
from datetime import datetime

from web3 import Web3

import helpers.Utils as Utils
import helpers.BridgeAPI as BridgeAPI
import helpers.Wallet as Wallet

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

def metamaskExecuteTransaction(driver, arbitragePlan, triggerButton, transactionType):
    clearTransactions(driver)
    switchToTab(driver, "bridge")
    triggerButton.click()
    switchToTab(driver, "metamask")
    currentTransactionQueue = int(findWebElement(driver, os.environ.get("METAMASK_TRANSACTIONS_QUEUE")).text.split("(")[1].replace(")", ""))

    transactionNumber = str(currentTransactionQueue + 1)
    transactionSelector = os.environ.get("METAMASK_PENDING_TRANSACTION").replace("<TRANSACTION_NUMBER>",
                                                                                 transactionNumber)
    transactionElement = findWebElement(driver, transactionSelector)
    transactionElement.click()

    transactionError = None
    try:
        transactionError = findWebElement(driver, os.getenv("METAMASK_TRANSACTION_ERROR_MSG"), 5)
        isTransactionError = True
    except:
        isTransactionError = False
        pass

    transactionAmount = float(findWebElement(driver, os.getenv("METAMASK_TRANSACTION_FEE")).text.split(" ")[0])
    gasPrice = arbitragePlan["arbitrageOrigin"]["network"]["price"]

    transactionFee = transactionAmount * gasPrice

    arbitragePlan["currentPotentialPL"] = arbitragePlan["currentPotentialPL"] - transactionFee

    arbitragePlan["stillProfitable"] = arbitragePlan["currentPotentialPL"] > 0

    transactionId = "1234"

    if not isTransactionError:
        transactionResult = {
            "AmountSent": arbitragePlan["arbitrageOrigin"]["amountSent"],
            "Successful": not isTransactionError,
            "TransactionType": transactionType,
            "ID": transactionId,
            "Fee": transactionFee,
            "Message": None,
            "Timestamp": Utils.getCurrentDateTime()
        }
    else:
        transactionErrorMessage = transactionError.text
        transactionResult = {
            "AmountSent": arbitragePlan["arbitrageOrigin"]["amountSent"],
            "Successful": not isTransactionError,
            "TransactionType": transactionType,
            "ID": None,
            "Fee": None,
            "Message": transactionErrorMessage,
            "Timestamp": Utils.getCurrentDateTime()
        }

    return transactionResult, arbitragePlan

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
        try:
            findWebElement(driver, os.environ.get("METAMASK_REJECT_BUTTON"), 5)
            totalPendingTransactions = 1
            pass
        except:
            totalPendingTransactions = 0
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

# def executeBridgeStatus(driver, arbitragePlan, bridgeBtn, bridgeBtnText):
#
#     if bridgeBtnText == "Insufficient JEWEL Balance":
#         stillProfitable = False
#         transactionResult = {
#             "AmountSent": arbitragePlan["arbitrageOrigin"]["amountSent"],
#             "Successful": False,
#             "TransactionType": None,
#             "ID": None,
#             "Fee": None,
#             "Message": bridgeBtnText,
#             "StillProfitable": stillProfitable
#         }
#     elif "Approve" in bridgeBtnText:
#         transactionResult, arbitragePlan = metamaskExecuteTransaction(driver, arbitragePlan, bridgeBtn, "Approve")
#     elif bridgeBtnText == "Bridge Token":
#          transactionResult, arbitragePlan = metamaskExecuteTransaction(driver, arbitragePlan, bridgeBtn, "Send")
#     else:
#         sys.exit("Unknown Bridge Status")
#
#     arbitragePlan[arbitragePlan["currentBridgeDirection"]]["bridgeResult"] = transactionResult
#
#     return arbitragePlan

def buildBridgeURL(inputToken, outputToken, chainId):
    synapseBridgeURL = os.environ.get("SYNAPSE_BRIDGE_URL")

    synapseBridgeURL = synapseBridgeURL.replace("<INPUT_TOKEN>", inputToken)
    synapseBridgeURL = synapseBridgeURL.replace("<OUTPUT_TOKEN>", outputToken)
    synapseBridgeURL = synapseBridgeURL.replace("<OUTPUT_CHAIN_ID>", chainId)

    return synapseBridgeURL

def calculateSynapseBridgeFees(arbitrageOrigin, arbitrageDestination, amountToBridge):

    i = 0

    arbitragePlan = {}

    networks = [arbitrageOrigin, arbitrageDestination]

    while i < 2:

        # Utils.printSeperator()
        # logger.info(f"[ARB #{arbitrageOrigin['roundTripCount']}] Switching Network For Bridge")
        # Utils.printSeperator()
        #
        # switchMetamaskNetwork(driver, networks[i]["chain"])

        if i <= 0:
            currentArbitrageOrigin = networks[0]
            currentArbitrageDestination = networks[1]
            Utils.printSeperator()
            logger.info(f"[ARB #{arbitrageOrigin['roundTripCount']}] Calculating Bridge Fees For Arbitrage Origin to Arbitrage Destination")
            Utils.printSeperator()
        else:
            currentArbitrageOrigin = networks[1]
            currentArbitrageDestination = networks[0]
            Utils.printSeperator()
            logger.info(f"[ARB #{arbitrageOrigin['roundTripCount']}] Calculating Bridge Fees For Arbitrage Destination to Arbitrage Origin")
            Utils.printSeperator()

        # logger.info("Building Synapse Bridge URL...")
        # synapseBridgeBridgeURL = buildBridgeURL(networks[i]["bridgeToken"], networks[1]["bridgeToken"],
        #                                         outputChainID)
        # logger.info(f"Synapse Bridge URL built: {synapseBridgeBridgeURL}")

        # logger.info("Opening Synapse Bridge...")
        # openBridgeTab(driver, synapseBridgeBridgeURL)
        # logger.info("Synapse Bridge opened!")

        # logger.info(f"Checking current {networks[i]['bridgeToken']} GUI balance...")
        # synapseCurrentTokenBalance = findWebElement(driver, os.environ.get("SYNAPSE_GUIBALANCE"))
        # synapseGUIBalance = synapseCurrentTokenBalance.text
        # logger.info(f"{networks[i]['bridgeToken']} GUI balance is currently {synapseGUIBalance}")

        # logger.info("Waiting for Synapse input field...")
        # inputTokenField = findWebElement(driver, os.environ.get("SYNAPSE_INPUTFIELD"))
        # logger.info("Synapse input field located!")
        #
        # logger.info(f"Entering {amountToBridge} {networks[i]['bridgeToken']} as the input token...")
        # inputTokenField.send_keys(str(amountToBridge))
        # logger.info("Entered input tokens!")
        #
        # outputFieldClass = findWebElement(driver, os.environ.get("SYNAPSE_OUTPUTFIELD_COLOR_XPATH"), selectorMode=False).get_attribute("class")
        # outputFieldColor = "bg-" + re.search('bg-(.*)\n', outputFieldClass).group(1)
        # outputField = os.environ.get("SYNAPSE_OUTPUTFIELD").replace("<OUTPUT-COLOR>", outputFieldColor)
        #
        # logger.info("Waiting for Synapse output field...")
        # outputTokenField = findWebElement(driver, outputField)
        # logger.info("Synapse output field located!")
        #
        # totalReceiveAmount = outputTokenField.get_attribute('value')
        #
        # while totalReceiveAmount == '':
        #     totalReceiveAmount = outputTokenField.get_attribute('value')
        #
        # totalReceiveAmount = float(totalReceiveAmount)
        #
        # logger.info(f"Checking {networks[i]['bridgeToken']} bridge fee...")
        # synapseFee = findWebElement(driver, os.environ.get("SYNAPSE_FEE"))
        # bridgeFee = float(synapseFee.text)
        # bridgeFeePercentage = Utils.percentageOf(bridgeFee, amountToBridge)
        # logger.info(f"Bridge fee is {bridgeFee} {networks[i]['bridgeToken']} ({bridgeFeePercentage}%)")
        #
        # logger.info(f"Checking bridge slippage fee...")
        # synapseSlippage = findWebElement(driver, os.environ.get("SYNAPSE_SLIPPAGE"))
        # synapseSlippageText = synapseSlippage.text
        # bridgeSlippage = float((synapseSlippageText).replace("%", ""))

        # if "-" in synapseSlippageText:
        #     logger.info(f"Bridge has a negative slippage of {bridgeSlippage}%")
        # else:
        #     logger.info(f"Bridge has a positive slippage of {bridgeSlippage}%")

        bridgeQuote = BridgeAPI.estimateBridgeOutput(currentArbitrageOrigin["networkDetails"]["chainID"], currentArbitrageDestination["networkDetails"]["chainID"], currentArbitrageOrigin["token"]["address"], currentArbitrageDestination["token"]["address"], amountToBridge)
        amountToReceive = bridgeQuote["amountToReceive"]
        bridgeFee = bridgeQuote["bridgeFee"]
        bridgeToken = networks[1]['bridgeToken']

        logger.info(f"After bridge we will receive {amountToReceive} {bridgeToken}")

        if i <= 0:
            objectTitle = "arbitrageOrigin"
            arbitragePlan[objectTitle] = \
                {
                    "network": arbitrageOrigin,
                    "amountSent": amountToBridge,
                    "bridgeFee": bridgeFee,
                    "bridgeToken": bridgeToken
                }
        else:
            objectTitle = "arbitrageDestination"
            arbitragePlan[objectTitle] = \
                {
                    "network": arbitrageDestination,
                    "amountExpectedToReceive": amountToReceive,
                    "bridgeFee": bridgeFee,
                    "bridgeToken": bridgeToken
                }

        i = i + 1

        Utils.printSeperator(True)

    Utils.printSeperator()
    logger.info(f"[ARB #{arbitrageOrigin['roundTripCount']}] Bridge Fees Calculated")
    Utils.printSeperator()

    feeAmount = arbitragePlan["arbitrageOrigin"]["bridgeFee"] + arbitragePlan["arbitrageDestination"]["bridgeFee"]
    tokenLoss = abs(arbitragePlan["arbitrageDestination"]["amountExpectedToReceive"] - arbitragePlan["arbitrageOrigin"]["amountSent"])

    arbitragePlan["bridgeTotals"] = {
        "bridgeToken": arbitragePlan['arbitrageOrigin']['bridgeToken'],
        "bridgeTotalTokenLoss": tokenLoss,
        "bridgeTotalFee": round(feeAmount, 6)
    }

    logger.info(f"Bridge Total Fee: {arbitragePlan['bridgeTotals']['bridgeTotalFee']} {arbitragePlan['bridgeTotals']['bridgeToken']}")

    return arbitragePlan

def executeBridge(arbitragePlan, amountToBridge):

    origin = arbitragePlan[arbitragePlan["currentBridgeDirection"]]
    destination = arbitragePlan[arbitragePlan["oppositeBridgeDirection"]]

    rpcURL = origin["network"]["networkDetails"]["chainRPC"]

    fromChain = origin["network"]["networkDetails"]["chainID"]
    toChain = destination["network"]["networkDetails"]["chainID"]

    fromToken = origin["bridgeToken"]
    toToken = destination["bridgeToken"]

    amountFrom = amountToBridge

    addressFrom = destination["walletAddress"]
    addressTo = destination["walletAddress"]

    bridgeTransaction = BridgeAPI.generateUnsignedBridgeTransaction(fromChain, toChain, fromToken, toToken, amountFrom, addressTo)

    w3 = Web3(Web3.HTTPProvider(rpcURL))

    tx = {
        'nonce': w3.eth.getTransactionCount(addressFrom),
        'from': addressFrom,
        'to': addressTo,
        'value': w3.toWei(amountFrom, 'ether'),
        'gas': 21000,
        'gasPrice': w3.eth.gas_price,
        'data': bridgeTransaction["unsigned_data"],
        "chainId": int(fromChain)
    }

    # transactionID = Wallet.sendRawTransaction(rpcURL, tx)
    transactionID = "0x97a0132993a148ed7b2c3a8e8d651f28e41cf7245c6fd728158b1262a376cb1b"

    arbitragePlan[arbitragePlan["currentBridgeDirection"]]["bridgeResult"] = {
                "AmountSent": arbitragePlan[arbitragePlan["currentBridgeDirection"]]["amountSent"],
                "Successful": True,
                "TransactionType": "Bridge",
                "ID": transactionID,
                "TransactionObject": tx,
                "Timestamp": Utils.getCurrentDateTime()
            }

    #
    # logger.info("Opening Synapse Bridge...")
    # openBridgeTab(driver, bridgeObject["bridgeURL"])
    # logger.info("Synapse Bridge opened!")
    #
    # logger.info("Waiting for Synapse input field...")
    # inputTokenField = findWebElement(driver, os.environ.get("SYNAPSE_INPUTFIELD"))
    # logger.info("Synapse input field located!")
    #
    # logger.info(f"Entering {amountToBridge} {bridgeObject['bridgeToken']} as the input token...")
    # inputTokenField.send_keys(str(amountToBridge))
    # logger.info("Entered input tokens!")
    #
    # outputFieldClass = findWebElement(driver, os.environ.get("SYNAPSE_OUTPUTFIELD_COLOR_XPATH"),
    #                                   selectorMode=False).get_attribute("class")
    # outputFieldColor = "bg-" + re.search('bg-(.*)\n', outputFieldClass).group(1)
    # outputField = os.environ.get("SYNAPSE_OUTPUTFIELD").replace("<OUTPUT-COLOR>", outputFieldColor)
    #
    # logger.info("Waiting for Synapse output field...")
    # outputTokenField = findWebElement(driver, outputField)
    # logger.info("Synapse output field located!")
    #
    # totalReceiveAmount = outputTokenField.get_attribute('value')
    #
    # while totalReceiveAmount == '':
    #     totalReceiveAmount = outputTokenField.get_attribute('value')
    #
    # totalReceiveAmount = float(totalReceiveAmount)
    #
    # bridgeBtn = findWebElement(driver, os.environ.get("SYNAPSE_BRIDGE_BTN_TXT"))
    # bridgeStatus = bridgeBtn.text
    #
    # arbitragePlan = executeBridgeStatus(driver, arbitragePlan, bridgeBtn, bridgeStatus)

    return arbitragePlan
    

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
