#!/bin/bash

# Exit on any error
set -e

echo "=========================================="
echo "🐳 Building CodeArena Docker Runners"
echo "=========================================="

# Ensure we are in the correct directory (backend root)
cd "$(dirname "$0")/.."

# Build Python Runner
echo "🔨 Building codearena-python..."
docker build -t codearena-python ./docker/python

# Build JavaScript (Node) Runner
echo "🔨 Building codearena-js..."
docker build -t codearena-js ./docker/js

# Build C Runner
echo "🔨 Building codearena-c..."
docker build -t codearena-c ./docker/c

# Build C++ Runner
echo "🔨 Building codearena-cpp..."
docker build -t codearena-cpp ./docker/cpp

# Note: If Java is needed in the future, uncomment below:
# echo "🔨 Building codearena-java..."
# docker build -t codearena-java ./docker/java

echo "=========================================="
echo "✅ All Docker runners built successfully!"
echo "=========================================="
echo "You can verify the images with: docker images | grep codearena"
