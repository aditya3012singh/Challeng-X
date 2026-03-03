FROM gcc:13.2.0

RUN apt-get update && \
    apt-get install -y python3 && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
CMD ["bash"]
