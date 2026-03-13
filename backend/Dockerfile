# Production Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build if needed)
RUN npm ci

# Copy Prisma schema for generation
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code and other necessary files
COPY . .

# Delete local .env and node_modules to ensure fresh build
RUN rm -rf .env node_modules

# Stage 2: Run Stage
FROM node:20-alpine

WORKDIR /app

# Install Docker CLI for sibling container orchestration
RUN apk add --no-cache docker-cli

# Copy only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built app (or source if no build step) from builder
COPY --from=builder /app ./

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Set production environment
ENV NODE_ENV=production
ARG PORT=4000
ENV PORT=${PORT}
EXPOSE ${PORT}

CMD ["npm", "start"]
