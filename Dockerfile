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
RUN npm install pm2 -g

COPY lib/chrome_1 /$HOME_DIR/chrome_1/
COPY lib/chrome_2 /$HOME_DIR/chrome_2/

COPY start.sh /
RUN chmod +x /start.sh

#CMD ["/start.sh"]

#ENTRYPOINT [ "python", "main.py" ]