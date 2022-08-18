FROM python:3.9

# Install base packages.
RUN apt update
RUN apt install iputils-ping -y

# Create a home directory.
ARG HOME_DIR="home/arBot"
RUN mkdir -p /$HOME_DIR
WORKDIR /$HOME_DIR

# Move and setup files in container.
COPY src/ /$HOME_DIR/src/
RUN mkdir -p /$HOME_DIR/log

# Setup python files
COPY [".env", "main.py", "requirements.txt", "/$HOME_DIR/"]
RUN pip install --root-user-action=ignore -r requirements.txt

ENTRYPOINT [ "python", "main.py" ]