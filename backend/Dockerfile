# Production Build Stage
FROM node:20-bookworm-slim AS builder

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

# Copy .env.production to .env for production build
COPY .env.production .env

# Stage 2: Run Stage
FROM node:20-bookworm-slim

WORKDIR /app

# Install Docker CLI and OpenSSL for sibling container orchestration and Prisma
RUN apt-get update -y && apt-get install -y docker.io openssl && rm -rf /var/lib/apt/lists/*

# Copy only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built app (or source if no build step) from builder
COPY --from=builder /app ./

# Generate Prisma Client in the final image
RUN npx prisma generate

# Create a non-root user for security (Optional: requires GID matching host docker group)
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
# USER appuser 

# Set production environment
ENV NODE_ENV=production
ARG PORT=4000
ENV PORT=${PORT}
EXPOSE ${PORT}

CMD ["npm", "start"]
