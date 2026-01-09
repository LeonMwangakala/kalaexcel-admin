# Production Deployment Guide

## Server Setup for Kala Excel Applications

### Server Information
- **IP Address**: 165.232.150.246
- **API Domain**: api.kalaexcel.com
- **Admin Domain**: core.kalaexcel.com
- **Website Domains**: www.kalaexcel.com, kalaexcel.com

---

## Step 1: Initial Server Setup

### 1.1 Update System Packages
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Install Required Software

#### Install PHP 8.2 and Extensions
```bash
sudo apt install -y software-properties-common
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y php8.2 php8.2-fpm php8.2-cli php8.2-common php8.2-mysql php8.2-zip php8.2-gd php8.2-mbstring php8.2-curl php8.2-xml php8.2-bcmath php8.2-pgsql php8.2-pdo-pgsql
```

#### Install Composer
```bash
cd ~
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
sudo chmod +x /usr/local/bin/composer
```

#### Install Node.js 20.x and npm
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

#### Install PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Install Nginx
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### Install Git
```bash
sudo apt install -y git
```

#### Install Certbot (for SSL)
```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

## Step 2: Configure PostgreSQL Database

### 2.1 Create Database and User
```bash
sudo -u postgres psql
```

Inside PostgreSQL prompt:
```sql
CREATE DATABASE kalaexcel_db;
CREATE USER kalaexcel_user WITH PASSWORD 'YOUR_SECURE_PASSWORD_HERE';
ALTER ROLE kalaexcel_user SET client_encoding TO 'utf8';
ALTER ROLE kalaexcel_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE kalaexcel_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE kalaexcel_db TO kalaexcel_user;
\q
```

### 2.2 Configure PostgreSQL for Remote Access (if needed)
```bash
sudo nano /etc/postgresql/*/main/postgresql.conf
```
Uncomment: `listen_addresses = 'localhost'`

```bash
sudo nano /etc/postgresql/*/main/pg_hba.conf
```
Add: `host    kalaexcel_db    kalaexcel_user    127.0.0.1/32    md5`

```bash
sudo systemctl restart postgresql
```

---

## Step 3: Clone and Setup Laravel API

### 3.1 Create Directory Structure
```bash
sudo mkdir -p /var/www/kalaexcel-api
sudo chown -R $USER:$USER /var/www/kalaexcel-api
```

### 3.2 Clone Repository
```bash
cd /var/www/kalaexcel-api
git clone https://github.com/LeonMwangakala/kalaexcel-api.git .
```

### 3.3 Install Dependencies
```bash
composer install --optimize-autoloader --no-dev
```

### 3.4 Configure Environment
```bash
cp .env.example .env
php artisan key:generate
```

### 3.5 Update .env File
```bash
nano .env
```

Update these values:
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.kalaexcel.com

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=kalaexcel_db
DB_USERNAME=kalaexcel_user
DB_PASSWORD=YOUR_SECURE_PASSWORD_HERE

CORS_ALLOWED_ORIGINS=https://core.kalaexcel.com,https://www.kalaexcel.com,https://kalaexcel.com
```

### 3.6 Run Migrations
```bash
php artisan migrate --force
php artisan db:seed --force
```

### 3.7 Optimize Laravel
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 3.8 Set Permissions
```bash
sudo chown -R www-data:www-data /var/www/kalaexcel-api
sudo chmod -R 755 /var/www/kalaexcel-api
sudo chmod -R 775 /var/www/kalaexcel-api/storage
sudo chmod -R 775 /var/www/kalaexcel-api/bootstrap/cache
```

---

## Step 4: Clone and Build React Admin App

### 4.1 Create Directory
```bash
sudo mkdir -p /var/www/kalaexcel-admin
sudo chown -R $USER:$USER /var/www/kalaexcel-admin
```

### 4.2 Clone Repository
```bash
cd /var/www/kalaexcel-admin
git clone https://github.com/LeonMwangakala/kalaexcel-admin.git .
```

### 4.3 Install Dependencies
```bash
npm install
```

### 4.4 Create Production Environment File
```bash
nano .env.production
```

Add:
```env
VITE_API_URL=https://api.kalaexcel.com
```

### 4.5 Build for Production
```bash
npm run build
```

### 4.6 Set Permissions
```bash
sudo chown -R www-data:www-data /var/www/kalaexcel-admin
sudo chmod -R 755 /var/www/kalaexcel-admin
```

---

## Step 5: Clone and Build React Website

### 5.1 Create Directory
```bash
sudo mkdir -p /var/www/kalaexcel-website
sudo chown -R $USER:$USER /var/www/kalaexcel-website
```

### 5.2 Clone Repository
```bash
cd /var/www/kalaexcel-website
git clone https://github.com/LeonMwangakala/kalaexcel-website.git .
```

### 5.3 Install Dependencies
```bash
npm install
```

### 5.4 Build for Production
```bash
npm run build
```

### 5.5 Set Permissions
```bash
sudo chown -R www-data:www-data /var/www/kalaexcel-website
sudo chmod -R 755 /var/www/kalaexcel-website
```

---

## Step 6: Configure Nginx Virtual Hosts

### 6.1 API Configuration (api.kalaexcel.com)
```bash
sudo nano /etc/nginx/sites-available/api.kalaexcel.com
```

Add:
```nginx
server {
    listen 80;
    server_name api.kalaexcel.com;
    root /var/www/kalaexcel-api/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

### 6.2 Admin App Configuration (core.kalaexcel.com)
```bash
sudo nano /etc/nginx/sites-available/core.kalaexcel.com
```

Add:
```nginx
server {
    listen 80;
    server_name core.kalaexcel.com;
    root /var/www/kalaexcel-admin/dist;

    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 6.3 Website Configuration (www.kalaexcel.com and kalaexcel.com)
```bash
sudo nano /etc/nginx/sites-available/kalaexcel.com
```

Add:
```nginx
server {
    listen 80;
    server_name kalaexcel.com www.kalaexcel.com;
    root /var/www/kalaexcel-website/dist;

    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 6.4 Enable Sites
```bash
sudo ln -s /etc/nginx/sites-available/api.kalaexcel.com /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/core.kalaexcel.com /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/kalaexcel.com /etc/nginx/sites-enabled/
```

### 6.5 Test and Reload Nginx
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 7: Setup SSL Certificates

### 7.1 Obtain SSL Certificates
```bash
sudo certbot --nginx -d api.kalaexcel.com
sudo certbot --nginx -d core.kalaexcel.com
sudo certbot --nginx -d kalaexcel.com -d www.kalaexcel.com
```

### 7.2 Auto-renewal Setup
```bash
sudo certbot renew --dry-run
```

---

## Step 8: Configure Laravel API CORS

Update `config/cors.php` in Laravel API:
```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_methods' => ['*'],
'allowed_origins' => [
    'https://core.kalaexcel.com',
    'https://www.kalaexcel.com',
    'https://kalaexcel.com',
],
'allowed_origins_patterns' => [],
'allowed_headers' => ['*'],
'exposed_headers' => [],
'max_age' => 0,
'supports_credentials' => true,
```

---

## Step 9: Update React Apps API URLs

### 9.1 Admin App (.env.production)
```env
VITE_API_URL=https://api.kalaexcel.com
```

### 9.2 Website (if needed)
Update any API references to use `https://api.kalaexcel.com`

---

## Step 10: Final Steps

### 10.1 Create Deployment Script
```bash
nano ~/deploy.sh
```

Add:
```bash
#!/bin/bash

# Deploy API
cd /var/www/kalaexcel-api
git pull origin main
composer install --optimize-autoloader --no-dev
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Deploy Admin
cd /var/www/kalaexcel-admin
git pull origin main
npm install
npm run build

# Deploy Website
cd /var/www/kalaexcel-website
git pull origin main
npm install
npm run build

echo "Deployment complete!"
```

```bash
chmod +x ~/deploy.sh
```

### 10.2 Setup Firewall
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## Troubleshooting

### Check Nginx Status
```bash
sudo systemctl status nginx
```

### Check PHP-FPM Status
```bash
sudo systemctl status php8.2-fpm
```

### Check PostgreSQL Status
```bash
sudo systemctl status postgresql
```

### View Nginx Error Logs
```bash
sudo tail -f /var/log/nginx/error.log
```

### View Laravel Logs
```bash
tail -f /var/www/kalaexcel-api/storage/logs/laravel.log
```

---

## Security Checklist

- [ ] Change default PostgreSQL password
- [ ] Set strong Laravel APP_KEY
- [ ] Configure firewall (UFW)
- [ ] Enable SSL certificates
- [ ] Set proper file permissions
- [ ] Disable APP_DEBUG in production
- [ ] Configure CORS properly
- [ ] Set up regular backups
- [ ] Configure log rotation
- [ ] Set up monitoring

---

## Notes

1. Replace `YOUR_SECURE_PASSWORD_HERE` with a strong password
2. Make sure DNS records point to server IP (165.232.150.246)
3. Test each application after deployment
4. Set up automated backups
5. Monitor server resources regularly


