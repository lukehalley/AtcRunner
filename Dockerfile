#FROM nikolaik/python-nodejs:python3.9-nodejs18

FROM selenium/standalone-chrome:103.0.5060.53-chromedriver-103.0.5060.53

#RUN apt-get update && apt-get install python3-distutils xvfb nano -y
#RUN wget https://bootstrap.pypa.io/get-pip.py
#RUN python3 get-pip.py

USER root

ARG HOME_DIR="home/arb-bot"

RUN mkdir -p /$HOME_DIR
WORKDIR /$HOME_DIR

RUN apt-get update && apt-get install -y nano python3-pip python-dev build-essential xvfb

# Python
COPY data/ /$HOME_DIR/data/
COPY dex/ /$HOME_DIR/dex/
COPY src/ /$HOME_DIR/src/
RUN mkdir -p /$HOME_DIR/log
COPY [".env", "main.py", "requirements.txt", "/$HOME_DIR/"]
RUN pip install -r requirements.txt

# Node API

RUN apt-get install -y nodejs npm
RUN curl -fsSL https://deb.nodesource.com/setup_current.x | bash - && \
 apt-get install -y nodejs

ARG SYNAPSE_API_DIR="lib/synapse-api"
COPY $SYNAPSE_API_DIR/ /$HOME_DIR/server/
COPY ["package.json", "/$HOME_DIR/"]
RUN npm i pm2

# Selenium
#ARG CHROME_VERSION="102.0.5005.115-1"
#ARG CHROMEDRIVER_VERSION="102.0.5005.61"
#ARG CHROMEDRIVER_LOCATION="/usr/bin"
#RUN wget --no-verbose -O /tmp/chrome.deb https://dl.google.com/linux/chrome/deb/pool/main/g/google-chrome-stable/google-chrome-stable_${CHROME_VERSION}_amd64.deb && \
#    apt-get update && \
#    apt install -y --allow-downgrades /tmp/chrome.deb && \
#    rm /tmp/chrome.deb && \
#    wget -q --continue -P $CHROMEDRIVER_LOCATION https://chromedriver.storage.googleapis.com/${CHROMEDRIVER_VERSION}/chromedriver_linux64.zip && \
#    unzip $CHROMEDRIVER_LOCATION/chromedriver* -d $CHROMEDRIVER_LOCATION && \
#    apt-get install xvfb nano -y

ARG src="lib/chrome"
COPY $src /$HOME_DIR/chrome/

#ENTRYPOINT [ "python", "main.py" ]