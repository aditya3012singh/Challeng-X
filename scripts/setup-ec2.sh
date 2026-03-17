#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting CodeArena EC2 Production Setup..."

# 1. Update System
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install Docker
if ! command -v docker &> /dev/null
then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "Docker installed successfully."
else
    echo "✅ Docker already installed."
fi

# 3. Install Docker Compose
if ! command -v docker-compose &> /dev/null
then
    echo "🐙 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "Docker Compose installed successfully."
else
    echo "✅ Docker Compose already installed."
fi

# 4. Create Directory Structure
mkdir -p certbot/conf certbot/www

# 5. Build Language Runners
echo "🛠 Building Language Runner Images..."
sudo docker build -t codearena-java ./backend/docker/java
sudo docker build -t codearena-cpp ./backend/docker/cpp
sudo docker build -t codearena-python ./backend/docker/python

# 6. Detect Host Path for Runners
export CODEARENA_RUNNERS_PATH="$(pwd)/backend/runners"
echo "CODEARENA_RUNNERS_PATH=${CODEARENA_RUNNERS_PATH}" >> .env

# 7. Instructions for user
echo "--------------------------------------------------------"
echo "✅ Prerequisites installed and Runner images built!"
echo "Next Steps:"
echo "1. Create ./backend/.env.production with your secrets."
echo "2. Update server_name in ./backend/deploy/nginx.conf with your domain."
echo "3. Run 'export CODEARENA_RUNNERS_PATH=$(pwd)/backend/runners' (or it's already in .env)"
echo "4. Run 'docker-compose up -d' to start the services."
echo "5. Obtain SSL Certificate (First time only):"
echo "   docker-compose run --rm certbot certonly --webroot --webroot-path=/var/www/certbot/ -d yourdomain.com"
echo "--------------------------------------------------------"
