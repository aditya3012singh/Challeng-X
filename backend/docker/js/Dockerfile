FROM node:18-slim

RUN apt-get update && \
    apt-get install -y python3 && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
CMD ["node", "/runners/js_runner.mjs"]
