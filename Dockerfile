FROM python:3.9

# Create a home directory.
ARG HOME_DIR="home/arBot"
RUN mkdir -p /$HOME_DIR
WORKDIR /$HOME_DIR

# Move and setup files in container.
COPY src/ /$HOME_DIR/src/
RUN mkdir -p /$HOME_DIR/data
RUN mkdir -p /$HOME_DIR/log

# Setup python files
COPY [".env", "main.py", "requirements.txt", "/$HOME_DIR/"]
RUN pip install -r requirements.txt

ENTRYPOINT [ "python", "main.py" ]