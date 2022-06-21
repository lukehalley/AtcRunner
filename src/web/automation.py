import logging
import os

from selenium.common.exceptions import NoSuchElementException, StaleElementReferenceException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from src.web.general import getOppositeDirection

logger = logging.getLogger("DFK-DEX")

# Waiting Functions

def findElementByText(driver, text):
    return findWebElement(driver=driver, elementString=f"//*[text()='{text}']", selectorMode=False)

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

def waitForDexToLoad(driver):
    isLoading = driver.find_elements_by_class_name(os.environ.get("DEX_LOADING_SPINNER_CLASS"))

    while isLoading:
        isLoading = driver.find_elements_by_class_name(os.environ.get("DEX_LOADING_SPINNER_CLASS"))

# Action Functions

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

def typeToField(element, text):
    element.send_keys(text)

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

def safeClick(driver, xpath):
    staleElement = True
    while staleElement:
        try:
            element = WebDriverWait(driver, timeout=15).until(EC.element_to_be_clickable((By.XPATH, xpath)))
            element.click()
            staleElement = False
        except StaleElementReferenceException:
            staleElement = True



