FROM node:20-bookworm-slim

WORKDIR /app

# Install Docker CLI for sibling container orchestration
RUN apt-get update -y && \
    apt-get install -y docker.io && \
    rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Set production environment
ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

# Health check (using Node.js instead of curl for slim image)
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["npm", "start"]
