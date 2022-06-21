import logging

logger = logging.getLogger("DFK-DEX")

def getCurrentOpenTabs(driver):
    tabs = []
    for handle in driver.window_handles:
        driver.switch_to.window(handle)

        tabURL = driver.current_url

        if tabURL not in tabs:
            tabs.append(driver.current_url)
    return tabs

def getCurrentTabCount(driver):
    return len(driver.window_handles)

def openURL(driver, url, newTab=False):
    if newTab:
        driver.execute_script(f'''window.open("{url}","_blank");''')
        driver.switch_to.window(driver.window_handles[-1])
    else:
        driver.get(url)

def switchToTab(driver, url):
    currentTabs = getCurrentOpenTabs(driver=driver)
    desiredTab = currentTabs.index(url)
    driver.switch_to_window(driver.window_handles[desiredTab])

def switchToTabByIndex(driver, index):
    driver.switch_to_window(driver.window_handles[index])

def getCurrentURL(driver):
    return driver.current_url

def closeLastTab(driver):
    driver.switch_to_window(driver.window_handles[-1])
    driver.close()

######################################################




