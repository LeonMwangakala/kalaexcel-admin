#!/bin/bash

# Production Deployment Script for Kala Excel Applications
# Run this script on the production server after initial setup

set -e  # Exit on error

echo "🚀 Starting deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
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
if [ "$EUID" -eq 0 ]; then 
    print_error "Please do not run as root. Use sudo for specific commands."
    exit 1
fi

# Deploy Laravel API
print_status "Deploying Laravel API..."
cd /var/www/kalaexcel-api
git pull origin main || print_warning "Git pull failed, continuing..."
composer install --optimize-autoloader --no-dev --no-interaction
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
print_status "Laravel API deployed successfully"

# Deploy Admin App
print_status "Deploying Admin App..."
cd /var/www/kalaexcel-admin
git pull origin main || print_warning "Git pull failed, continuing..."
npm ci --production
npm run build
print_status "Admin App deployed successfully"

# Deploy Website
print_status "Deploying Website..."
cd /var/www/kalaexcel-website
git pull origin main || print_warning "Git pull failed, continuing..."
npm ci --production
npm run build
print_status "Website deployed successfully"

# Set permissions
print_status "Setting permissions..."
sudo chown -R www-data:www-data /var/www/kalaexcel-api
sudo chown -R www-data:www-data /var/www/kalaexcel-admin
sudo chown -R www-data:www-data /var/www/kalaexcel-website
sudo chmod -R 755 /var/www/kalaexcel-api
sudo chmod -R 755 /var/www/kalaexcel-admin
sudo chmod -R 755 /var/www/kalaexcel-website
sudo chmod -R 775 /var/www/kalaexcel-api/storage
sudo chmod -R 775 /var/www/kalaexcel-api/bootstrap/cache
print_status "Permissions set successfully"

# Reload services
print_status "Reloading services..."
sudo systemctl reload php8.2-fpm
sudo systemctl reload nginx
print_status "Services reloaded"

echo ""
print_status "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Verify all applications are accessible"
echo "2. Check logs if any issues occur"
echo "3. Test API endpoints"
echo ""


