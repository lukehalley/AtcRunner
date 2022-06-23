from selenium import webdriver

from pyvirtualdisplay import Display
display = Display(visible=False, size=(1920, 1080))
display.start()

# chrome_options = webdriver.ChromeOptions()
chrome_options = webdriver.ChromeOptions()

chrome_options.add_argument("--start-maximized")
chrome_options.add_argument(f"--user-data-dir=/home/arb-bot/chrome")
chrome_options.add_argument("--profile-directory=Profile 1")

# chrome_options.add_experimental_option("prefs", {"profile.managed_default_content_settings.images": 2})
# chrome_options.add_argument("--no-sandbox")
# chrome_options.add_argument("--disable-setuid-sandbox")
#
# chrome_options.add_argument("--remote-debugging-port=9222")  # this
#
# chrome_options.add_argument("--disable-dev-shm-using")
# chrome_options.add_argument("--disable-extensions")
# chrome_options.add_argument("--disable-gpu")
# chrome_options.add_argument("start-maximized")
# chrome_options.add_argument("disable-infobars")
driver = webdriver.Chrome(chrome_options=chrome_options, service_args=["--verbose", "--log-path=./ChromeDriver.log"])

driver.get('https://stackoverflow.com')
screenshot = driver.save_screenshot('test.png')
driver.quit()

