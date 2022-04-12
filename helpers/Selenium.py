import os
import time

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
    return (
        os.path.exists('/.dockerenv') or
        os.path.isfile(path) and any('docker' in line for line in open(path))
    )

isDocker = is_docker()

print (f"Running In Docker {isDocker}", "\n")

if isDocker:
    display = Display(visible=0, size=(1920, 1080))
    display.start()

chrome_options = webdriver.ChromeOptions()
userdatadir = "/Users/luke/Documents/chrome"

if isDocker:
    chrome_options.add_argument(f"user-data-dir=/home/seluser/chrome/")
else:
    chrome_options.add_argument(f"user-data-dir=/Users/luke/Documents/chrome")

chrome_options.add_argument("profile-directory=Profile 6")

if isDocker:
    driver = webdriver.Chrome(executable_path='/usr/bin/chromedriver', chrome_options=chrome_options)
else:
    driver = webdriver.Chrome(executable_path='/Users/luke/bin/chromedriver', chrome_options=chrome_options)

print("Going to chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/home.html")
driver.get('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/home.html')

driver.save_screenshot('screen.png')

print("Title:")
print(driver.title)

print("Waiting password")
element = WebDriverWait(driver, 30).until(
    EC.visibility_of_element_located((By.CSS_SELECTOR, "#password"))
)

print("Filling in password")
element.send_keys('7r3M6Y6pSW7&Lq23W$jW')

print("Pressing enter")
element.send_keys(Keys.RETURN)

print("Title:")
print(driver.title)

print("DONE!")
driver.close()

if isDocker:
    display.stop()