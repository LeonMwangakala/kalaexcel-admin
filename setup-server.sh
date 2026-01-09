#!/bin/bash

# Initial Server Setup Script for Kala Excel Production
# Run this script on a fresh Ubuntu server
# Usage: bash setup-server.sh

set -e

echo "=========================================="
echo "Kala Excel Production Server Setup"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "This script must be run as root (use sudo)"
    exit 1
fi

# Step 1: Update System
print_status "Updating system packages..."
apt update && apt upgrade -y
print_status "System updated"

# Step 2: Install PHP 8.2
print_status "Installing PHP 8.2 and extensions..."
apt install -y software-properties-common
add-apt-repository ppa:ondrej/php -y
apt update
apt install -y php8.2 php8.2-fpm php8.2-cli php8.2-common php8.2-zip php8.2-gd php8.2-mbstring php8.2-curl php8.2-xml php8.2-bcmath php8.2-pgsql php8.2-pdo-pgsql
print_status "PHP 8.2 installed"

# Step 3: Install Composer
print_status "Installing Composer..."
if [ ! -f /usr/local/bin/composer ]; then
    cd /tmp
    curl -sS https://getcomposer.org/installer | php
    mv composer.phar /usr/local/bin/composer
    chmod +x /usr/local/bin/composer
    print_status "Composer installed"
else
    print_warning "Composer already installed"
fi

# Step 4: Install Node.js 20.x
print_status "Installing Node.js 20.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    print_status "Node.js installed: $(node --version)"
else
    print_warning "Node.js already installed: $(node --version)"
fi

# Step 5: Install PostgreSQL
print_status "Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql
print_status "PostgreSQL installed"

# Step 6: Install Nginx
print_status "Installing Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx
print_status "Nginx installed"

# Step 7: Install Git
print_status "Installing Git..."
apt install -y git
print_status "Git installed"

# Step 8: Install Certbot
print_status "Installing Certbot..."
apt install -y certbot python3-certbot-nginx
print_status "Certbot installed"

# Step 9: Setup PostgreSQL Database
print_status "Setting up PostgreSQL database..."
print_warning "You will need to set a secure password for the database user"
read -sp "Enter password for kalaexcel_user: " DB_PASSWORD
echo ""

sudo -u postgres psql <<EOF
CREATE DATABASE kalaexcel_db;
CREATE USER kalaexcel_user WITH PASSWORD '$DB_PASSWORD';
ALTER ROLE kalaexcel_user SET client_encoding TO 'utf8';
ALTER ROLE kalaexcel_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE kalaexcel_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE kalaexcel_db TO kalaexcel_user;
\q
EOF

print_status "Database created: kalaexcel_db"
print_status "User created: kalaexcel_user"
print_warning "Save this password securely: $DB_PASSWORD"

# Step 10: Create directories
print_status "Creating application directories..."
mkdir -p /var/www/kalaexcel-api
mkdir -p /var/www/kalaexcel-admin
mkdir -p /var/www/kalaexcel-website
print_status "Directories created"

# Step 11: Setup firewall
print_status "Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
print_status "Firewall configured"

echo ""
echo "=========================================="
print_status "Server setup complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Clone the repositories:"
echo "   cd /var/www/kalaexcel-api && git clone https://github.com/LeonMwangakala/kalaexcel-api.git ."
echo "   cd /var/www/kalaexcel-admin && git clone https://github.com/LeonMwangakala/kalaexcel-admin.git ."
echo "   cd /var/www/kalaexcel-website && git clone https://github.com/LeonMwangakala/kalaexcel-website.git ."
echo ""
echo "2. Follow the DEPLOYMENT_GUIDE.md for detailed configuration"
echo ""
echo "3. Make sure DNS records point to this server (165.232.150.246)"
echo ""


