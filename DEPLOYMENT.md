# Hướng dẫn Deploy ICN Lab Website lên Production

## 1. Chuẩn bị Server

### Yêu cầu hệ thống
- Ubuntu 20.04 LTS hoặc mới hơn
- 2GB RAM minimum (4GB khuyến nghị)
- 20GB disk space
- Domain name đã cấu hình DNS

### Cài đặt các dependencies cần thiết

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx
sudo apt install -y nginx

# Install PM2 globally
sudo npm install -g pm2

# Install Git
sudo apt install -y git
```

## 2. Deploy Backend API

### Clone và setup project

```bash
# Tạo thư mục cho project
sudo mkdir -p /var/www/icnlab
sudo chown $USER:$USER /var/www/icnlab

# Clone repository (hoặc upload files)
cd /var/www/icnlab
# git clone <your-repo-url> .
# hoặc upload files bằng scp/sftp

# Install dependencies
cd backend
npm install --production

# Tạo file .env
cp .env.example .env
nano .env
```

### Cấu hình .env cho production

```env
PORT=5000
NODE_ENV=production

# MongoDB URI
MONGODB_URI=mongodb://localhost:27017/icnlab

# JWT Secret - Tạo secret mạnh
JWT_SECRET=your_very_long_and_secure_random_string_here_min_32_chars

# Admin credentials
ADMIN_EMAIL=admin@ptit.edu.vn
ADMIN_PASSWORD=ChangeThisPassword123!

# File upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880

# CORS - Domain thật của bạn
CORS_ORIGIN=https://icnlab.ptit.edu.vn
```

### Seed database

```bash
node scripts/seed.js
```

### Setup PM2

```bash
# Start app with PM2
pm2 start server.js --name icnlab-api

# Save PM2 process list
pm2 save

# Setup PM2 startup script
pm2 startup

# Theo hướng dẫn của PM2 và chạy lệnh nó cung cấp
```

### PM2 useful commands

```bash
# View logs
pm2 logs icnlab-api

# Restart app
pm2 restart icnlab-api

# Stop app
pm2 stop icnlab-api

# Monitor
pm2 monit

# View status
pm2 status
```

## 3. Deploy Frontend và Admin

### Copy files

```bash
# Copy frontend
sudo cp -r /var/www/icnlab/frontend/* /var/www/html/icnlab/

# Copy admin
sudo cp -r /var/www/icnlab/admin /var/www/html/icnlab/admin/

# Set permissions
sudo chown -R www-data:www-data /var/www/html/icnlab
sudo chmod -R 755 /var/www/html/icnlab
```

### Cập nhật API URL trong frontend files

```bash
# Update API_BASE_URL in frontend/api.js
sudo nano /var/www/html/icnlab/api.js
# Change: const API_BASE_URL = 'https://api.icnlab.ptit.edu.vn/api';

# Update API_BASE_URL in admin files
sudo nano /var/www/html/icnlab/admin/login.html
sudo nano /var/www/html/icnlab/admin/admin.js
# Change: const API_BASE_URL = 'https://api.icnlab.ptit.edu.vn/api';
```

## 4. Cấu hình Nginx

### Tạo config cho main website

```bash
sudo nano /etc/nginx/sites-available/icnlab
```

```nginx
server {
    listen 80;
    server_name icnlab.ptit.edu.vn www.icnlab.ptit.edu.vn;
    
    root /var/www/html/icnlab;
    index index.html;

    # Logs
    access_log /var/log/nginx/icnlab-access.log;
    error_log /var/log/nginx/icnlab-error.log;

    # Main website
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Admin panel
    location /admin {
        try_files $uri $uri/ /admin/index.html;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
```

### Tạo config cho API

```bash
sudo nano /etc/nginx/sites-available/icnlab-api
```

```nginx
server {
    listen 80;
    server_name api.icnlab.ptit.edu.vn;

    # Logs
    access_log /var/log/nginx/icnlab-api-access.log;
    error_log /var/log/nginx/icnlab-api-error.log;

    # Proxy to Node.js backend
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve uploaded files
    location /uploads {
        alias /var/www/icnlab/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### Enable sites

```bash
# Enable sites
sudo ln -s /etc/nginx/sites-available/icnlab /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/icnlab-api /etc/nginx/sites-enabled/

# Test Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## 5. Setup SSL với Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificates
sudo certbot --nginx -d icnlab.ptit.edu.vn -d www.icnlab.ptit.edu.vn -d api.icnlab.ptit.edu.vn

# Auto renewal test
sudo certbot renew --dry-run
```

## 6. Firewall Configuration

```bash
# Allow SSH
sudo ufw allow ssh

# Allow HTTP/HTTPS
sudo ufw allow 'Nginx Full'

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## 7. Database Backup Script

```bash
# Create backup directory
sudo mkdir -p /backup/mongodb

# Create backup script
sudo nano /usr/local/bin/backup-icnlab-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backup/mongodb"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="icnlab"

# Create backup
mongodump --db $DB_NAME --out $BACKUP_DIR/$TIMESTAMP

# Keep only last 7 days of backups
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;

echo "Backup completed: $BACKUP_DIR/$TIMESTAMP"
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-icnlab-db.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-icnlab-db.sh >> /var/log/mongodb-backup.log 2>&1
```

## 8. Monitoring và Maintenance

### View logs

```bash
# Nginx logs
sudo tail -f /var/log/nginx/icnlab-access.log
sudo tail -f /var/log/nginx/icnlab-api-access.log

# PM2 logs
pm2 logs icnlab-api

# MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

### Performance monitoring

```bash
# Install htop
sudo apt install htop

# Monitor system
htop

# MongoDB stats
mongo icnlab --eval "db.stats()"
```

## 9. Security Best Practices

### MongoDB security

```bash
# Enable MongoDB authentication
mongo admin
```

```javascript
use admin
db.createUser({
  user: "icnlab_admin",
  pwd: "SecurePassword123!",
  roles: [ { role: "readWrite", db: "icnlab" } ]
})
```

Update .env:
```env
MONGODB_URI=mongodb://icnlab_admin:SecurePassword123!@localhost:27017/icnlab?authSource=admin
```

### Regular updates

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Update Node.js packages
cd /var/www/icnlab/backend
npm update

# Restart app
pm2 restart icnlab-api
```

## 10. Troubleshooting

### Backend not responding

```bash
# Check PM2 status
pm2 status

# Restart
pm2 restart icnlab-api

# Check logs
pm2 logs icnlab-api --lines 100
```

### Nginx errors

```bash
# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

### MongoDB issues

```bash
# Check status
sudo systemctl status mongod

# Restart
sudo systemctl restart mongod

# Check logs
sudo tail -f /var/log/mongodb/mongod.log
```

## 11. Post-Deployment Checklist

- [ ] API health check: https://api.icnlab.ptit.edu.vn/api/health
- [ ] Website accessible: https://icnlab.ptit.edu.vn
- [ ] Admin panel works: https://icnlab.ptit.edu.vn/admin
- [ ] Can login to admin
- [ ] CRUD operations work
- [ ] File uploads work
- [ ] SSL certificates valid
- [ ] Database backup scheduled
- [ ] Monitoring setup
- [ ] Change default admin password
- [ ] Update API URLs in all files
- [ ] Test on mobile devices
- [ ] SEO meta tags configured

## Support

Nếu gặp vấn đề, kiểm tra:
1. PM2 logs: `pm2 logs`
2. Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. MongoDB status: `sudo systemctl status mongod`

Email: icnlab@ptit.edu.vn
