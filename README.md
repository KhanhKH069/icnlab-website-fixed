# 🚀 ICN Lab Website - Ready to Run! (với Theme System)

## ✨ Tính năng mới: Đổi Theme 1 Click!

Bạn có thể dễ dàng thay đổi giao diện website theo mùa/sự kiện mà **KHÔNG CẦN BIẾT CODE**!

### 🎨 **5 Theme có sẵn:**
1. **Tết Nguyên Đán** - Đỏ vàng, hoa mai
2. **Normal** - Chuyên nghiệp, xanh đen  
3. **Giáng Sinh** - Xanh đỏ, text Merry Christmas
4. **Quốc Khánh 2/9** - Đỏ vàng cờ VN
5. **Khai Giảng** - Xanh dương, năm học mới

### 📝 **Cách đổi theme (3 giây):**

1. Mở file: `frontend/theme-config.js`
2. Tìm dòng: `const ACTIVE_PRESET = 'tet';`  
3. Đổi thành: `'normal'` hoặc `'christmas'` hoặc theme khác
4. Lưu và refresh browser (F5)

**Thế thôi!** Không cần restart server!

### 🎯 **Preview themes:**

Mở file trong browser: `frontend/theme-preview.html`

---

## 🏃‍♂️ Quick Start:

### **Lần đầu - Setup:**
```
Double-click: SETUP.bat
```

### **Các lần sau - Khởi động:**
```
Double-click: START.bat
```

**Login Admin:** admin@ptit.edu.vn / admin123

---

## 📁 Files quan trọng:

```
├── SETUP.bat              # Setup 1 lần
├── START.bat              # Khởi động
├── THEME-GUIDE.md         # ⭐ Hướng dẫn theme
├── frontend/
│   ├── theme-config.js    # ⭐ Đổi theme ở đây
│   └── theme-preview.html # ⭐ Xem preview
```

---

## 🎨 Quick Theme Change:

```javascript
// Sau Tết:
const ACTIVE_PRESET = 'normal';

// Giáng Sinh:
const ACTIVE_PRESET = 'christmas';

// Quốc Khánh:
const ACTIVE_PRESET = 'nationalDay';
```

Xem `THEME-GUIDE.md` để biết thêm!

---

## 📞 Support:

Email: icnlab@ptit.edu.vn
