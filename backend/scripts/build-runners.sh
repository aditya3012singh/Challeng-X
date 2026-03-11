#!/bin/bash

# Exit on any error
set -e

echo "=========================================="
echo "🐳 Building CodeArena Docker Runners"
echo "=========================================="

# Ensure we are in the correct directory (backend root)
cd "$(dirname "$0")/.."

# Build C++ Runner  
echo "🔨 Building codearena-cpp..."
docker build -t codearena-cpp ./docker/cpp

# Build Java Runner
echo "🔨 Building codearena-java..."
docker build -t codearena-java ./docker/java

echo "=========================================="
echo "✅ All Docker runners built successfully!"
echo "=========================================="
echo "You can verify the images with: docker images | grep codearena"
