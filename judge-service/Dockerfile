# Judge Service Dockerfile
FROM node:20-alpine

# Install Docker CLI for container orchestration
RUN apk add --no-cache docker-cli

# Set working directory
WORKDIR /app

# Copy package files
COPY judge-service/package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy source code
COPY judge-service/src/ ./src/

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose gRPC port
EXPOSE 50051

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Start the service
CMD ["npm", "start"]
