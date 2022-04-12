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
    passwordInput = WebDriverWait(driver, 30).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "#password"))
    )
    print("Password input located!", "\n")

    print("Filling in password...")
    mmPassword = os.environ.get("KNOCKKNOCK")
    passwordInput.send_keys(mmPassword)
    print("Password inputted!", "\n")

    print("Pressing enter...")
    passwordInput.send_keys(Keys.RETURN)
    print("Enter key pressed!", "\n")

    print("Checking if logged in...")
    WebDriverWait(driver, 30).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "#app-content > div > div.main-container-wrapper > div > div > div > div.tabs"))
    )
    print("Metamask logged in!", "\n")

def buildBridgeURL(inputToken, outputToken, chainId):

    synapseBridgeURL = os.environ.get("SYNAPSE_BRIDGE_URL")

    synapseBridgeURL = synapseBridgeURL.replace("<INPUT_TOKEN>", inputToken)
    synapseBridgeURL = synapseBridgeURL.replace("<OUTPUT_TOKEN>", outputToken)
    synapseBridgeURL = synapseBridgeURL.replace("<OUTPUT_CHAIN_ID>", chainId)

    return synapseBridgeURL

def synapseBridge(driver):

    print("Opening Synapse Bridge...")
    synapseBridgeBridgeURL = os.environ.get("SYNAPSE_BRIDGE_URL")
    driver.get(f'chrome-extension://{mmExtString}/home.html')
    print("Metamask opened!", "\n")

def switchMetamaskNetwork(driver, networkToSwitchTo):

    openMetamaskTab(driver)

    print("Locating Metamask switch dropdown...")
    switchDropdown = WebDriverWait(driver, 30).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "#app-content > div > div.app-header.app-header--back-drop > div > div.app-header__account-menu-container > div.app-header__network-component-wrapper > div"))
    )
    print("Metamask switch dropdown located!", "\n")

    print("Getting current network...")
    switchDropdown = WebDriverWait(driver, 30).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "#app-content > div > div.app-header.app-header--back-drop > div > div.app-header__account-menu-container > div.app-header__network-component-wrapper > div > span"))
    )
    currentNetwork = switchDropdown.text
    print(f"Got current network: {currentNetwork}", "\n")

    if (currentNetwork == networkToSwitchTo):
        print(f"We are already on {networkToSwitchTo} - no need to switch!", "\n")
        return
    else:
        print("Clicking Metamask switch dropdown...")
        switchDropdown.click()
        print("Metamask switch dropdown Clicked!", "\n")

        print("Checking dropdown is open...")
        switchDropdown = WebDriverWait(driver, 30).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "#app-content > div > div.menu-droppo-container.network-droppo > div > button"))
        )
        print("Metamask switch dropdown is open!", "\n")

        print("Getting network list element...")
        switchDropdown = WebDriverWait(driver, 30).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "#app-content > div > div.menu-droppo-container.network-droppo > div > div.network-dropdown-list"))
        )
        print("Got network list element!", "\n")

        print(f"Switching to {networkToSwitchTo}...")
        networkListItem = driver.find_element_by_xpath("//span[text()='DFK Chain']")
        networkListItem.click()
        print(f"Switched to {networkToSwitchTo}!", "\n")

driver = initBrowser()
loginIntoMetamask(driver)
bridgeURL = buildBridgeURL("JEWEL", "JEWEL", "53935")
switchMetamaskNetwork(driver, "DFK Chain")
x = 1