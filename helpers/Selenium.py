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
import json

#  Load Web Element Selectors
with open('./helpers/webElements.json') as json_file:
    webElements = json.load(json_file)

x = 1

def findWebElement(selector, timeout=30):
    return WebDriverWait(driver, timeout).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, selector))
    )

def is_docker():
    path = '/proc/self/cgroup'
    result = os.path.exists('/.dockerenv') or os.path.isfile(path) and any('docker' in line for line in open(path))
    return (result)

def initBrowser():

    isDocker = is_docker()

    if isDocker:
        display = Display(visible=0, size=(1920, 1080))
        display.start()

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

    return driver

def openMetamaskTab(driver):

    load_dotenv()

    print("Opening Metamask tab...")
    mmExtString = os.environ.get("MM_EXT_STR")
    driver.get(f'chrome-extension://{mmExtString}/home.html')
    print("Metamask opened!", "\n")

def loginIntoMetamask(driver):

    load_dotenv()

    openMetamaskTab(driver)

    print("Waiting for Metamask password input...")
    passwordInput = findWebElement(os.environ.get("METAMASK_PASSWORDINPUT"))
    print("Password input located!", "\n")

    print("Filling in password...")
    mmPassword = os.environ.get("KNOCKKNOCK")
    passwordInput.send_keys(mmPassword)
    print("Password inputted!", "\n")

    print("Pressing enter...")
    passwordInput.send_keys(Keys.RETURN)
    print("Enter key pressed!", "\n")

    print("Checking if logged in...")
    findWebElement(os.environ.get("METAMASK_TABS"))
    print("Metamask logged in!", "\n")

def buildBridgeURL(inputToken, outputToken, chainId):

    synapseBridgeURL = os.environ.get("SYNAPSE_BRIDGE_URL")

    synapseBridgeURL = synapseBridgeURL.replace("<INPUT_TOKEN>", inputToken)
    synapseBridgeURL = synapseBridgeURL.replace("<OUTPUT_TOKEN>", outputToken)
    synapseBridgeURL = synapseBridgeURL.replace("<OUTPUT_CHAIN_ID>", chainId)

    return synapseBridgeURL

def executeSynapseBridge(driver, inputToken, outputToken, chainId, amount):

    print("Building Synapse Bridge URL...")
    synapseBridgeBridgeURL = buildBridgeURL(inputToken, outputToken, chainId)
    print(f"Synapse Bridge URL built: {synapseBridgeBridgeURL}", "\n")

    print("Opening Synapse Bridge...")
    driver.get(synapseBridgeBridgeURL)
    print("Synapse Bridge opened!", "\n")

    print(f"Checking current {inputToken} GUI balance...")
    synapseCurrentTokenBalance = findWebElement(os.environ.get("SYNAPSE_GUIBALANCE"))
    synapseGUIBalance = synapseCurrentTokenBalance.text
    print(f"{inputToken} GUI balance is currently {synapseGUIBalance}", "\n")

    print("Waiting for Synapse input and output token field...")
    inputTokenField = findWebElement(os.environ.get("SYNAPSE_INPUTFIELD"))
    outputTokenField = findWebElement(os.environ.get("SYNAPSE_OUTPUTFIELD"))
    print("Synapse input and output token fields located!", "\n")

    print(f"Entering {amount} {inputToken} as the input token...")
    inputTokenField.send_keys(amount)
    print("Entered input tokens!", "\n")

    time.sleep(5)

    print(f"Checking how many {inputToken} we will get after bridging...")
    synapseTokenOut = outputTokenField.get_attribute('value')
    print(f"We will get {synapseTokenOut} {inputToken} after we bridge.", "\n")

    print(f"Checking {inputToken} bridge fee...")
    synapseFee = findWebElement(os.environ.get("SYNAPSE_FEE"))
    synapseFeeAmount = synapseFee.text
    print(f"Bridge fee is {synapseFeeAmount} {inputToken}", "\n")

    print(f"Checking bridge slippage fee...")
    synapseSlippage = findWebElement(os.environ.get("SYNAPSE_SLIPPAGE"))
    synapseSlippageAmount = synapseSlippage.text

    if "-" in synapseSlippageAmount:
        print(f"Bridge has a negative slippage of {synapseSlippageAmount}", "\n")
    else:
        print(f"Bridge has a positive slippage of {synapseSlippageAmount}", "\n")

    time.sleep(5)

    print(f"Checking bridge button status")
    synapseBridgeBtnText = findWebElement(os.environ.get("SYNAPSE_BRIDGE_BTN_TXT"))
    synapseBridgeStatusText = synapseBridgeBtnText.text
    print(f"Current bridge button status is '{synapseBridgeStatusText}'", "\n")

    if synapseBridgeBtnText == "Bridge Token":
        readyToBridge = True
    else:
        readyToBridge = False

    print(f"Ready to bridge: {readyToBridge}")

def switchMetamaskNetwork(driver, networkToSwitchTo):

    openMetamaskTab(driver)

    print("Locating Metamask switch dropdown...")
    switchDropdown = findWebElement(os.environ.get("METAMASK_SWITCHDROPDOWN"))
    print("Metamask switch dropdown located!", "\n")

    print("Getting current network...")
    mmCurrentNetwork = findWebElement(os.environ.get("METAMASK_CURRENTNETWORK"))
    currentNetwork = mmCurrentNetwork.text
    print(f"Got current network: {currentNetwork}", "\n")

    if (currentNetwork == networkToSwitchTo):
        print(f"We are already on {networkToSwitchTo} - no need to switch!", "\n")
        return
    else:
        print("Clicking Metamask switch dropdown...")
        switchDropdown.click()
        print("Metamask switch dropdown Clicked!", "\n")

        print("Checking dropdown is open...")
        findWebElement(os.environ.get("METAMASK_ADDNETWORKBUTTON"))
        print("Metamask switch dropdown is open!", "\n")

        print("Getting network list element...")
        findWebElement(os.environ.get("METAMASK_NETWORKLIST"))
        print("Got network list element!", "\n")

        print(f"Switching to {networkToSwitchTo}...")
        networkListItem = driver.find_element_by_xpath(f"//span[text()='{networkToSwitchTo}']")
        networkListItem.click()
        print(f"Switched to {networkToSwitchTo}!", "\n")

driver = initBrowser()
loginIntoMetamask(driver)
switchMetamaskNetwork(driver, "avalanchedfk")
executeSynapseBridge(driver, "JEWEL", "JEWEL", "1666600000", "10")
x = 1