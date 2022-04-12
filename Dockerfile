FROM selenium/standalone-chrome

USER root
RUN apt-get update && apt-get install python3-distutils xvfb nano -y
RUN wget https://bootstrap.pypa.io/get-pip.py
RUN python3 get-pip.py
RUN python3 -m pip install selenium

RUN mkdir -p /home/seluser/dfk-arb
COPY dex/ /home/seluser/dfk-arb/dex/
COPY helpers /home/seluser/dfk-arb/helpers/
# COPY chrome/ /home/seluser/chrome/
COPY /Users/luke/Documents/chrome/ /home/seluser/chrome/
COPY private /home/seluser/dfk-arb/private/
COPY web /home/seluser/dfk-arb/web/
COPY [".env", "main.py", "requirements.txt", "/home/seluser/dfk-arb/"]

WORKDIR "/home/seluser/dfk-arb"

RUN pip install -r requirements.txt