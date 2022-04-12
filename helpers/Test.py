from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time
from pyvirtualdisplay import Display

display = Display(visible=0, size=(800, 600))
display.start()

chrome_options = Options()
userdatadir = "./Chrome"
chrome_options.add_argument(f"user-data-dir={userdatadir}")
chrome_options.add_argument("profile-directory=Profile 1")
# chrome_options.add_extension("proxy.zip")

driver = webdriver.Chrome(executable_path='/usr/bin/chromedriver', chrome_options=chrome_options)
time.sleep(3)
driver.get("https://ipinfo.io/json")
print(driver.page_source)
driver.close()

display.stop()