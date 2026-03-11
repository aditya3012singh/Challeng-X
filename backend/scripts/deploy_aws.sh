#!/bin/bash
# deploy_aws.sh
# Automated setup for the CodeArena backend on an Ubuntu Server EC2 instance

set -e

echo "=========================================================="
echo " Starting CodeArena Backend Deployment on AWS EC2 (Ubuntu)"
echo "=========================================================="

# 1. Update system packages
echo ">>> Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y curl wget git unzip dbus-user-session

# 2. Install Docker (required for code execution runners)
if ! command -v docker &> /dev/null; then
    echo ">>> Installing Docker..."
    # Add Docker's official GPG key:
    sudo apt-get install -y ca-certificates curl
    sudo install -m 0755 -d /etc/apt/keyrings
    sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    sudo chmod a+r /etc/apt/keyrings/docker.asc

    # Add the repository to Apt sources:
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # Configure Docker to run without sudo for the current user
    sudo usermod -aG docker $USER
    echo ">>> Docker installed. PLEASE NOTE: group membership changes might require a logout/login, but we will apply them for this script."
    sudo systemctl enable docker
    sudo systemctl start docker
else
    echo ">>> Docker is already installed."
fi

# 3. Start Redis Server via Docker
echo ">>> Starting Redis container..."
if ! sudo docker ps | grep -q 'codearena-redis'; then
    sudo docker run -d --name codearena-redis -p 6379:6379 --restart always redis:7-alpine
    echo ">>> Redis started on port 6379."
else
    echo ">>> Redis is already running."
fi

# 4. Install Node.js (v20) via NVM
echo ">>> Installing Node.js..."
export NVM_DIR="$HOME/.nvm"
if [ ! -d "$NVM_DIR" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    \. "$NVM_DIR/nvm.sh"
    nvm install 20
    nvm use 20
    nvm alias default 20
else
    \. "$NVM_DIR/nvm.sh"
    nvm use 20
fi
node -v
npm -v

# 5. Install global npm packages
echo ">>> Installing PM2..."
npm install -g pm2

# 6. Build Code Execution Runner Docker Images
echo ">>> Building Sandbox Code Runner Docker Images..."
cd "$(dirname "$0")/.." # Go to backend root
# we will use sudo docker to avoid group membership issues during script execution
sudo docker build -t codearena-cpp ./docker/cpp
sudo docker build -t codearena-java ./docker/java

# 7. Install Backend Dependencies
echo ">>> Installing backend dependencies..."
npm install

# 8. Generate Prisma Client
echo ">>> Generating Prisma Client..."
npx prisma generate

# 9. Start Application with PM2
echo ">>> Starting application with PM2..."
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup | tail -n 1 > /tmp/pm2-startup.sh
chmod +x /tmp/pm2-startup.sh
sudo /tmp/pm2-startup.sh

echo "=========================================================="
echo " Deployment Complete!"
echo " Backend is running via PM2."
echo " Note: Your .env file must be properly configured!"
echo " Check logs using: pm2 logs"
echo "=========================================================="
