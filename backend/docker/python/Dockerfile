FROM python:3.10-slim

RUN apt-get update && \
    apt-get install -y python3 && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
CMD ["python3", "-u", "/runners/python_runner.py"]
