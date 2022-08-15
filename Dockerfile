FROM python:3.9

# Install base packages.
RUN apt update
RUN apt install iputils-ping curl unzip -y

# Create a home directory.
ARG HOME_DIR="home/arBot"
RUN mkdir -p /$HOME_DIR
WORKDIR /$HOME_DIR

# Install AWS CLI
RUN curl https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip -o awscliv2.zip \
  && unzip awscliv2.zip \
  && ./aws/install \
  && rm -rf aws awscliv2.zip

# Move and setup files in container.
COPY data/ /$HOME_DIR/data/
COPY src/dex/ /$HOME_DIR/dex/
COPY src/ /$HOME_DIR/src/
RUN mkdir -p /$HOME_DIR/log

# Setup python files
COPY [".env", "main.py", "requirements.txt", "/$HOME_DIR/"]
RUN pip install -r requirements.txt

ENTRYPOINT [ "python", "main.py" ]