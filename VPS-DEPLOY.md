# Deploy ICN Lab lên VPS – từng bước

Hướng dẫn deploy lên **Ubuntu VPS** (20.04+). Làm lần lượt từ Bước 1.

---

## Trước khi bắt đầu

- VPS Ubuntu (2GB RAM trở lên).
- Domain đã trỏ về IP VPS:
  - `icnlab.ptit.edu.vn` (hoặc domain của bạn) → IP VPS
  - `api.icnlab.ptit.edu.vn` → cùng IP VPS
- SSH vào VPS: `ssh root@<IP>` (hoặc user có quyền sudo).

---

## Bước 1: Cài đặt môi trường trên VPS

```bash
sudo apt update && sudo apt upgrade -y

# Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-6.0.gpg
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Nginx
sudo apt install -y nginx

# PM2 (chạy Backend Node.js)
sudo npm install -g pm2
```

*(Nếu dùng Ubuntu 20.04 thay `jammy` bằng `focal` trong dòng MongoDB.)*

---

## Bước 2: Đưa code lên VPS

**Cách A – Dùng Git (nếu có repo):**

```bash
sudo mkdir -p /var/www/icnlab
sudo chown $USER:$USER /var/www/icnlab
cd /var/www/icnlab
git clone <url-repo-của-bạn> .
```

**Cách B – Upload bằng SCP (từ máy Windows):**

Trên **máy bạn** (PowerShell hoặc CMD), ở thư mục chứa project:

```bash
scp -r backend frontend admin START.bat package.json root@<IP-VPS>:/var/www/icnlab/
```

Trên **VPS** trước đó cần tạo thư mục:

```bash
sudo mkdir -p /var/www/icnlab
sudo chown $USER:$USER /var/www/icnlab
```

Sau khi upload, trên VPS kiểm tra:

```bash
ls /var/www/icnlab
# Cần thấy: backend  frontend  admin
```

---

## Bước 3: Cấu hình và chạy Backend

```bash
cd /var/www/icnlab/backend

npm install --production

cp .env.example .env
nano .env
```

**Sửa `.env` cho production:**

```env
PORT=5000
NODE_ENV=production

MONGODB_URI=mongodb://localhost:27017/icnlab

# Tạo chuỗi bí mật dài (vd: openssl rand -hex 32)
JWT_SECRET=<chuỗi-32-ký-tự-trở-lên>

ADMIN_EMAIL=admin@ptit.edu.vn
ADMIN_PASSWORD=<đặt-mật-khẩu-mạnh>

UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880

# Domain web thật, cách nhau bởi dấu phẩy
CORS_ORIGIN=https://icnlab.ptit.edu.vn,https://www.icnlab.ptit.edu.vn
```

Lưu file (Ctrl+O, Enter, Ctrl+X trong nano).

**Tạo thư mục upload + seed admin (lần đầu):**

```bash
mkdir -p uploads
node scripts/seed.js
```

**Chạy Backend bằng PM2:**

```bash
pm2 start server.js --name icnlab-api
pm2 save
pm2 startup
# Chạy đúng lệnh mà PM2 in ra (copy-paste)
```

Kiểm tra: `curl http://localhost:5000/api/health` → phải trả về JSON.

---

## Bước 4: Deploy Frontend + Admin (file tĩnh)

```bash
# Tạo thư mục web
sudo mkdir -p /var/www/html/icnlab

# Copy toàn bộ frontend (trang chủ, about, research, ...)
sudo cp -r /var/www/icnlab/frontend/* /var/www/html/icnlab/

# Copy admin
sudo cp -r /var/www/icnlab/admin /var/www/html/icnlab/

# Phân quyền
sudo chown -R www-data:www-data /var/www/html/icnlab
sudo chmod -R 755 /var/www/html/icnlab
```

**Lưu ý:** `frontend/config.js` và `admin/config.js` đã tự nhận API theo domain. Nếu bạn dùng `icnlab.ptit.edu.vn` và `api.icnlab.ptit.edu.vn` thì **không cần sửa tay**.

---

## Bước 5: Cấu hình Nginx

**5.1 – Site chính (trang web + admin):**

```bash
sudo nano /etc/nginx/sites-available/icnlab
```

Dán (thay `icnlab.ptit.edu.vn` bằng domain của bạn nếu khác):

```nginx
server {
    listen 80;
    server_name icnlab.ptit.edu.vn www.icnlab.ptit.edu.vn;

    root /var/www/html/icnlab;
    index index.html;

    access_log /var/log/nginx/icnlab-access.log;
    error_log /var/log/nginx/icnlab-error.log;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /admin {
        try_files $uri $uri/ /admin/index.html;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
```

**5.2 – Site API (proxy sang Backend):**

```bash
sudo nano /etc/nginx/sites-available/icnlab-api
```

Dán (thay `api.icnlab.ptit.edu.vn` nếu bạn dùng tên khác):

```nginx
server {
    listen 80;
    server_name api.icnlab.ptit.edu.vn;

    access_log /var/log/nginx/icnlab-api-access.log;
    error_log /var/log/nginx/icnlab-api-error.log;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads {
        alias /var/www/icnlab/backend/uploads;
        expires 30d;
    }
}
```

**5.3 – Bật site và reload Nginx:**

```bash
sudo ln -sf /etc/nginx/sites-available/icnlab /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/icnlab-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Sau bước này có thể test:
- Trang web: `http://icnlab.ptit.edu.vn`
- Admin: `http://icnlab.ptit.edu.vn/admin/` hoặc `.../admin/login.html`
- API: `http://api.icnlab.ptit.edu.vn/api/health`

---

## Bước 6: Bật HTTPS (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d icnlab.ptit.edu.vn -d www.icnlab.ptit.edu.vn -d api.icnlab.ptit.edu.vn
```

Làm theo hướng dẫn (email, đồng ý điều khoản). Certbot sẽ tự sửa Nginx để dùng HTTPS.

Kiểm tra gia hạn tự động:

```bash
sudo certbot renew --dry-run
```

---

## Bước 7: Firewall (khuyến nghị)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## Sau khi deploy

| Thành phần | URL |
|------------|-----|
| Trang chủ | https://icnlab.ptit.edu.vn |
| Admin | https://icnlab.ptit.edu.vn/admin/ |
| API | https://api.icnlab.ptit.edu.vn |

- Đăng nhập Admin bằng email/mật khẩu đã đặt trong `.env` (sau khi seed).
- Nếu đổi domain: sửa `server_name` trong Nginx và `CORS_ORIGIN` trong `.env`, rồi `sudo nginx -t && sudo systemctl reload nginx` và `pm2 restart icnlab-api`.

---

## Lệnh hữu ích

```bash
# Log Backend
pm2 logs icnlab-api

# Khởi động lại Backend
pm2 restart icnlab-api

# Trạng thái
pm2 status
```

Chi tiết thêm (backup DB, bảo mật MongoDB, v.v.) xem **[DEPLOYMENT.md](./DEPLOYMENT.md)**.
