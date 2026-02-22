# Hướng dẫn Publish Website ICN Lab

## Tóm tắt nhanh

Website gồm **3 phần**:
1. **Backend** (Node.js, port 5000) – API + MongoDB
2. **Frontend** (HTML/CSS/JS) – trang web công khai
3. **Admin** (HTML/JS) – trang quản trị

Để publish, bạn cần: **máy chủ (VPS/server)** có Node.js, MongoDB, Nginx (hoặc dùng dịch vụ host).

---

## Cách 1: Publish lên VPS/Server (Linux)

Đây là cách thường dùng cho domain riêng (vd: `icnlab.ptit.edu.vn`).

### Bước 1: Chuẩn bị server
- VPS Ubuntu 20.04+ (hoặc tương đương)
- Cài: **Node.js 18**, **MongoDB**, **Nginx**, **PM2**
- Trỏ domain (vd: `icnlab.ptit.edu.vn`, `api.icnlab.ptit.edu.vn`) về IP server

### Bước 2: Upload code lên server
- Clone repo hoặc upload thư mục project (backend, frontend, admin) lên server, ví dụ: `/var/www/icnlab`

### Bước 3: Chạy Backend
```bash
cd /var/www/icnlab/backend
cp .env.example .env
nano .env   # Sửa: MONGODB_URI, JWT_SECRET, CORS_ORIGIN (domain thật), ADMIN password
npm install --production
node scripts/seed.js   # Tạo admin lần đầu (nếu cần)
pm2 start server.js --name icnlab-api
pm2 save
```

### Bước 4: Cấu hình Nginx
- **Trang web + Admin:** serve thư mục `frontend` + `admin` (static files)
- **API:** reverse proxy từ `api.icnlab.ptit.edu.vn` → `http://localhost:5000`
- **Upload ảnh:** serve thư mục `backend/uploads` qua Nginx (vd: `/uploads`)

### Bước 5: SSL (HTTPS)
- Dùng **Let's Encrypt** (Certbot) cho domain và api subdomain

**Chi tiết từng bước, cấu hình Nginx mẫu, PM2, backup DB:** xem file **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

---

## Cách 2: Dùng dịch vụ Hosting (không tự quản server)

- **Backend:** cần host hỗ trợ **Node.js** (VD: Railway, Render, Heroku, VPS nhỏ).
- **MongoDB:** dùng **MongoDB Atlas** (free tier) thay cho MongoDB cài trên server.
- **Frontend + Admin:** có thể đặt trên:
  - **Netlify** / **Vercel** (static): upload thư mục `frontend` và `admin`, cấu hình build = none.
  - Hoặc cùng server với Backend, dùng Nginx serve static.

**Lưu ý:** Trên production nhớ:
1. Đổi **JWT_SECRET** và **mật khẩu Admin** trong `.env`.
2. Trong **CORS** (backend) thêm domain thật (vd: `https://icnlab.ptit.edu.vn`).
3. **config.js** (frontend + admin) đã tự nhận: nếu truy cập bằng domain (không phải localhost) sẽ gọi API tại `https://api.<domain>/api`. Ví dụ: web `icnlab.ptit.edu.vn` → API `https://api.icnlab.ptit.edu.vn/api`.

---

## Checklist trước khi publish

- [ ] Đổi mật khẩu Admin trong `.env` và trên DB (seed)
- [ ] Đặt `JWT_SECRET` mạnh (chuỗi dài, random)
- [ ] Cấu hình `CORS_ORIGIN` = domain web thật (vd: `https://icnlab.ptit.edu.vn`)
- [ ] Dùng **HTTPS** cho cả web và API
- [ ] Cấu hình backup MongoDB (định kỳ)
- [ ] Test: đăng nhập Admin, thêm/sửa News, Members, Publications, upload ảnh

---

## Sau khi publish

- **Web:** `https://icnlab.ptit.edu.vn` (hoặc domain bạn đặt)
- **Admin:** `https://icnlab.ptit.edu.vn/admin` (hoặc `.../admin/login.html`)
- **API:** `https://api.icnlab.ptit.edu.vn` (health: `/api/health`)

Nếu gặp lỗi, xem mục **Troubleshooting** và **Support** trong [DEPLOYMENT.md](./DEPLOYMENT.md).
