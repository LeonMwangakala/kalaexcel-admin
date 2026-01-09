# Quick Start Deployment Guide

## Prerequisites
- SSH access to server (165.232.150.246)
- DNS records configured:
  - api.kalaexcel.com → 165.232.150.246
  - core.kalaexcel.com → 165.232.150.246
  - www.kalaexcel.com → 165.232.150.246
  - kalaexcel.com → 165.232.150.246

## Step 1: Connect to Server
```bash
ssh root@165.232.150.246
# or
ssh your-user@165.232.150.246
```

## Step 2: Run Initial Setup Script
```bash
# Download and run the setup script
wget https://raw.githubusercontent.com/LeonMwangakala/kalaexcel-admin/main/setup-server.sh
# Or copy the setup-server.sh file to the server
chmod +x setup-server.sh
sudo ./setup-server.sh
```

This will install:
- PHP 8.2 with all required extensions
- Composer
- Node.js 20.x
- PostgreSQL
- Nginx
- Git
- Certbot (for SSL)

## Step 3: Clone Repositories

### API
```bash
cd /var/www/kalaexcel-api
git clone https://github.com/LeonMwangakala/kalaexcel-api.git .
composer install --optimize-autoloader --no-dev
```

### Admin App
```bash
cd /var/www/kalaexcel-admin
git clone https://github.com/LeonMwangakala/kalaexcel-admin.git .
npm install
```

### Website
```bash
cd /var/www/kalaexcel-website
git clone https://github.com/LeonMwangakala/kalaexcel-website.git .
npm install
```

## Step 4: Configure Laravel API

### Create .env file
```bash
cd /var/www/kalaexcel-api
cp .env.example .env
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
DB_PASSWORD=YOUR_DB_PASSWORD

SANCTUM_STATEFUL_DOMAINS=core.kalaexcel.com,www.kalaexcel.com,kalaexcel.com

SESSION_DOMAIN=.kalaexcel.com
```

### Generate key and run migrations
```bash
php artisan key:generate
php artisan migrate --force
php artisan db:seed --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Set permissions
```bash
sudo chown -R www-data:www-data /var/www/kalaexcel-api
sudo chmod -R 755 /var/www/kalaexcel-api
sudo chmod -R 775 /var/www/kalaexcel-api/storage
sudo chmod -R 775 /var/www/kalaexcel-api/bootstrap/cache
```

## Step 5: Configure Admin App

### Create .env.production file
```bash
cd /var/www/kalaexcel-admin
nano .env.production
```

Add:
```env
VITE_API_BASE_URL=https://api.kalaexcel.com/api
```

### Build for production
```bash
npm run build
sudo chown -R www-data:www-data /var/www/kalaexcel-admin
```

## Step 6: Configure Website

### Build for production
```bash
cd /var/www/kalaexcel-website
npm run build
sudo chown -R www-data:www-data /var/www/kalaexcel-website
```

## Step 7: Configure Nginx

### API Configuration
```bash
sudo nano /etc/nginx/sites-available/api.kalaexcel.com
```

Paste:
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

### Admin App Configuration
```bash
sudo nano /etc/nginx/sites-available/core.kalaexcel.com
```

Paste:
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

### Website Configuration
```bash
sudo nano /etc/nginx/sites-available/kalaexcel.com
```

Paste:
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

### Enable sites
```bash
sudo ln -s /etc/nginx/sites-available/api.kalaexcel.com /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/core.kalaexcel.com /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/kalaexcel.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Step 8: Setup SSL Certificates

```bash
sudo certbot --nginx -d api.kalaexcel.com
sudo certbot --nginx -d core.kalaexcel.com
sudo certbot --nginx -d kalaexcel.com -d www.kalaexcel.com
```

## Step 9: Verify Deployment

1. Visit https://api.kalaexcel.com/api/health (should return status)
2. Visit https://core.kalaexcel.com (admin app)
3. Visit https://www.kalaexcel.com (website)

## Troubleshooting

### Check Nginx logs
```bash
sudo tail -f /var/log/nginx/error.log
```

### Check Laravel logs
```bash
tail -f /var/www/kalaexcel-api/storage/logs/laravel.log
```

### Restart services
```bash
sudo systemctl restart nginx
sudo systemctl restart php8.2-fpm
sudo systemctl restart postgresql
```

### Test database connection
```bash
sudo -u postgres psql -d kalaexcel_db -U kalaexcel_user
```

## Future Deployments

Use the deploy.sh script for quick updates:
```bash
cd ~
chmod +x deploy.sh
./deploy.sh
```


