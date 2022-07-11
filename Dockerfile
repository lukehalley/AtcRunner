FROM python:3.9

RUN apt update
RUN apt install iputils-ping -y

ARG HOME_DIR="home/arb-bot"
RUN mkdir -p /$HOME_DIR
WORKDIR /$HOME_DIR

# Python
COPY data/ /$HOME_DIR/data/
COPY src/dex/ /$HOME_DIR/dex/
COPY src/ /$HOME_DIR/src/
RUN mkdir -p /$HOME_DIR/log
COPY [".env", "main.py", "requirements.txt", "/$HOME_DIR/"]
RUN pip install -r requirements.txt

ENTRYPOINT [ "python", "main.py" ]