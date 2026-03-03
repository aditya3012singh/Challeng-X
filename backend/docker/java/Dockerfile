FROM eclipse-temurin:17-jdk-jammy

# Install Python 3 to run the orchestrator script
RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
CMD ["python3", "-u", "/runners/java_runner.py"]
