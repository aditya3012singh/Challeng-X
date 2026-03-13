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

# 5. Instructions for user
echo "--------------------------------------------------------"
echo "✅ Prerequisites installed!"
echo "Next Steps:"
echo "1. Create ./backend/.env.production with your secrets."
echo "2. Update server_name in ./backend/deploy/nginx.conf with your domain."
echo "3. Run 'docker-compose up -d' to start the services."
echo "4. Obtain SSL Certificate (First time only):"
echo "   docker-compose run --rm certbot certonly --webroot --webroot-path=/var/www/certbot/ -d yourdomain.com"
echo "--------------------------------------------------------"
