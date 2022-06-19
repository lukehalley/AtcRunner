FROM nikolaik/python-nodejs:python3.9-nodejs18

ARG HOME_DIR="home/arb-bot"

RUN mkdir -p /$HOME_DIR
WORKDIR /$HOME_DIR

# Python
COPY data/ /$HOME_DIR/data/
COPY dex/ /$HOME_DIR/dex/
COPY src/ /$HOME_DIR/src/
RUN mkdir -p /$HOME_DIR/log
COPY [".env", "main.py", "requirements.txt", "init.sh", "/$HOME_DIR/"]
RUN pip install -r requirements.txt

# Node API
ARG SYNAPSE_API_DIR="/server"
COPY $SYNAPSE_API_DIR/ /$HOME_DIR/$SYNAPSE_API_DIR/
COPY ["package.json", "/$HOME_DIR/"]

ENTRYPOINT [ "python", "main.py" ]