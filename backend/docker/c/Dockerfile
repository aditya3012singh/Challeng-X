FROM gcc:13.2.0

RUN apt-get update && \
    apt-get install -y python3 && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
CMD ["python3", "-u", "/runners/c_runner.py"]
