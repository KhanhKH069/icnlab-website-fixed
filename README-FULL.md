# ICN Lab Website - Full Stack Project

Website hoàn chỉnh cho Intelligently Connected Networks Lab - PTIT với backend Node.js/Express, MongoDB và frontend hiện đại.

## 📋 Tính năng

### Backend API
- ✅ Authentication & Authorization (JWT)
- ✅ CRUD operations cho News, Publications, Projects, Members
- ✅ File upload (images, PDFs)
- ✅ Role-based access control (Admin, Editor, Viewer)
- ✅ RESTful API với validation
- ✅ MongoDB database với Mongoose

### Frontend
- ✅ Responsive design với theme Tết 2026
- ✅ Màu đỏ PTIT chủ đạo
- ✅ Animations mượt mà
- ✅ SEO-friendly

### Admin Dashboard
- ✅ Quản lý tin tức
- ✅ Quản lý publications
- ✅ Quản lý projects
- ✅ Quản lý members
- ✅ Upload files/images
- ✅ Rich text editor

## 🚀 Cài đặt

### Yêu cầu
- Node.js >= 16.x
- MongoDB >= 5.x
- npm hoặc yarn

### Backend Setup

```bash
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env từ .env.example
cp .env.example .env

# Chỉnh sửa .env với thông tin của bạn
nano .env

# Khởi chạy server
npm run dev
```

### Database Setup

```bash
# Đảm bảo MongoDB đang chạy
sudo systemctl start mongod

# Import dữ liệu mẫu (nếu có)
node scripts/seed.js
```

### Frontend Setup

```bash
cd frontend

# Mở file index.html trong browser
# Hoặc sử dụng live server
python -m http.server 8000
```

### Admin Dashboard Setup

```bash
cd admin

# Mở file index.html trong browser
# Hoặc sử dụng live server
python -m http.server 8001
```

## 📁 Cấu trúc thư mục

```
icnlab-website/
├── backend/
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── controllers/     # Route controllers
│   ├── uploads/         # Uploaded files
│   ├── server.js        # Main server file
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── index.html       # Main website
│   ├── assets/          # CSS, JS, images
│   └── api.js           # API integration
└── admin/
    ├── index.html       # Admin dashboard
    ├── login.html       # Login page
    └── assets/          # Admin assets
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register (Admin only)
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password

### News
- `GET /api/news` - Get all news
- `GET /api/news/:id` - Get single news
- `POST /api/news` - Create news (Auth required)
- `PUT /api/news/:id` - Update news (Auth required)
- `DELETE /api/news/:id` - Delete news (Auth required)

### Publications
- `GET /api/publications` - Get all publications
- `GET /api/publications/:id` - Get single publication
- `POST /api/publications` - Create publication (Auth required)
- `PUT /api/publications/:id` - Update publication (Auth required)
- `DELETE /api/publications/:id` - Delete publication (Auth required)

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project (Auth required)
- `PUT /api/projects/:id` - Update project (Auth required)
- `DELETE /api/projects/:id` - Delete project (Auth required)

### Members
- `GET /api/members` - Get all members
- `GET /api/members/:id` - Get single member
- `POST /api/members` - Create member (Auth required)
- `PUT /api/members/:id` - Update member (Auth required)
- `DELETE /api/members/:id` - Delete member (Auth required)

## 🔒 Security

- Passwords được hash với bcryptjs
- JWT tokens cho authentication
- Role-based authorization
- Input validation với express-validator
- File upload restrictions
- CORS configuration

## 🌐 Deployment

### Backend (VPS/Cloud)

```bash
# Production build
npm install --production

# Sử dụng PM2
npm install -g pm2
pm2 start server.js --name icnlab-api

# Hoặc sử dụng systemd
sudo systemctl enable icnlab-api
```

### Frontend (Nginx/Apache)

```bash
# Copy files to web root
sudo cp -r frontend/* /var/www/html/icnlab/

# Configure Nginx
sudo nano /etc/nginx/sites-available/icnlab
```

### Database Backup

```bash
# Backup MongoDB
mongodump --db icnlab --out /backup/icnlab-$(date +%Y%m%d)

# Restore
mongorestore --db icnlab /backup/icnlab-20260214/icnlab
```

## 📝 Default Admin Account

**Email:** admin@ptit.edu.vn  
**Password:** admin123

⚠️ **Quan trọng:** Đổi password ngay sau khi đăng nhập lần đầu!

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Kiểm tra MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod
```

### Port Already in Use
```bash
# Tìm process đang dùng port
lsof -i :5000

# Kill process
kill -9 <PID>
```

## 📚 Technologies Used

### Backend
- Node.js & Express.js
- MongoDB & Mongoose
- JWT Authentication
- Multer (File upload)
- Bcryptjs (Password hashing)

### Frontend
- HTML5, CSS3, JavaScript
- Responsive Design
- Fetch API
- Local Storage

## 📧 Support

Email: icnlab@ptit.edu.vn  
Website: https://icnlab.ptit.edu.vn

## 📄 License

Copyright © 2026 ICN Lab - PTIT. All rights reserved.
