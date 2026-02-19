# 🎨 Hướng Dẫn Thay Đổi Theme Website

## 🚀 Quick Change - Đổi Theme Nhanh (3 giây)

### **Bước 1: Mở file cấu hình**
```
D:\icnlab-website-fixed\frontend\theme-config.js
```

### **Bước 2: Tìm dòng này (khoảng dòng 150):**
```javascript
const ACTIVE_PRESET = 'tet';
```

### **Bước 3: Đổi thành một trong các giá trị:**
```javascript
// Theme bình thường (sau Tết)
const ACTIVE_PRESET = 'normal';

// Theme Giáng Sinh
const ACTIVE_PRESET = 'christmas';

// Theme Quốc Khánh 2/9
const ACTIVE_PRESET = 'nationalDay';

// Theme Khai giảng
const ACTIVE_PRESET = 'backToSchool';

// Theme Tết (hiện tại)
const ACTIVE_PRESET = 'tet';
```

### **Bước 4: Refresh browser (F5)**
Xong! Không cần restart server!

---

## 🎭 Các Theme Có Sẵn

### 1️⃣ **Tết Nguyên Đán** (`tet`)
- Nền đỏ gradient
- Hoa mai vàng
- Text: "🎊 Chúc Mừng Năm Mới Bính Ngọ 2026 🎊"
- Màu accent: Vàng gold

### 2️⃣ **Normal** (`normal`)
- Nền xanh đen chuyên nghiệp
- Không có hoa
- Không có seasonal text
- Màu accent: Xanh dương

### 3️⃣ **Christmas** (`christmas`)
- Nền xanh lá + đỏ
- Có hoa trang trí
- Text: "🎄 Merry Christmas 2025 🎅"
- Màu accent: Đỏ

### 4️⃣ **National Day** (`nationalDay`)
- Nền đỏ + vàng (màu cờ VN)
- Có hoa trang trí
- Text: "🇻🇳 Chào Mừng Quốc Khánh 2/9 🇻🇳"
- Màu accent: Vàng

### 5️⃣ **Back to School** (`backToSchool`)
- Nền xanh dương
- Không có hoa
- Text: "📚 Chào Mừng Năm Học Mới 📚"
- Màu accent: Xanh nhạt

---

## ✏️ Custom Text & Colors

Muốn custom riêng? Mở `theme-config.js` và sửa:

### **Đổi text chúc mừng:**
```javascript
// Tìm phần hero.seasonalText (dòng 30-35):
seasonalText: {
    enabled: true,
    text: '🎊 Text của bạn ở đây 🎊',  // ← Sửa chỗ này
    color: '#fbbf24',
    fontSize: '1.5rem'
}
```

### **Đổi màu nền hero:**
```javascript
// Tìm phần hero.backgroundColor (dòng 17-21):
backgroundColor: {
    start: '#991b1b',    // Màu bắt đầu
    middle: '#dc2626',   // Màu giữa
    end: '#b91c1c'       // Màu kết thúc
}
```

### **Bật/tắt hoa mai:**
```javascript
// Tìm dòng này (dòng 24):
showFlowers: true,  // true = hiện, false = ẩn
```

### **Đổi statistics:**
```javascript
// Tìm phần hero.stats (dòng 41-45):
stats: [
    { number: '100+', label: 'Publications' },    // ← Sửa số
    { number: '20+', label: 'Active Projects' },
    { number: '50+', label: 'Researchers' }
]
```

---

## 🤖 Auto Theme - Tự Động Đổi Theo Ngày

Muốn website tự động đổi theme theo mùa?

### **Bật tính năng:**
```javascript
// Tìm dòng này (dòng 180):
enabled: false,  // Đổi thành true
```

### **Cấu hình lịch:**
```javascript
schedule: [
    { start: '12-20', end: '12-26', preset: 'christmas' },
    { start: '01-20', end: '02-20', preset: 'tet' },
    { start: '08-25', end: '09-03', preset: 'nationalDay' },
    { start: '09-01', end: '09-10', preset: 'backToSchool' },
]
```

Format: `'MM-DD'` (tháng-ngày)

---

## 🎨 Tạo Theme Mới

### **Bước 1: Thêm preset mới**

Trong `theme-config.js`, tìm phần `presets` và thêm:

```javascript
presets: {
    // ... các preset cũ ...
    
    // Theme mới của bạn
    myCustomTheme: {
        name: 'Tên Theme',
        heroBackground: 'linear-gradient(135deg, #màu1 0%, #màu2 100%)',
        showFlowers: true,  // true/false
        seasonalText: '🎉 Text của bạn 🎉',
        accentColor: '#màu_accent'
    }
}
```

### **Bước 2: Active theme mới**
```javascript
const ACTIVE_PRESET = 'myCustomTheme';
```

---

## 🎯 Examples

### **Ví dụ 1: Đổi sang theme bình thường sau Tết**

Mở `theme-config.js`, đổi:
```javascript
const ACTIVE_PRESET = 'normal';
```
Refresh browser → Xong!

### **Ví dụ 2: Tạo theme Valentine**

Thêm vào `presets`:
```javascript
valentine: {
    name: 'Valentine',
    heroBackground: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
    showFlowers: true,
    seasonalText: '💕 Happy Valentine Day 💕',
    accentColor: '#f43f5e'
}
```

Active:
```javascript
const ACTIVE_PRESET = 'valentine';
```

### **Ví dụ 3: Theme Giáng Sinh với text tiếng Việt**

Sửa preset `christmas`:
```javascript
christmas: {
    name: 'Christmas',
    heroBackground: 'linear-gradient(135deg, #166534 0%, #22c55e 50%, #dc2626 100%)',
    showFlowers: true,
    seasonalText: '🎄 Giáng Sinh An Lành 🎅',  // ← Đổi text
    accentColor: '#ef4444'
}
```

---

## 🔍 Tìm Màu (Color Picker)

Cần chọn màu? Dùng một trong các tools:

- Google: "color picker"
- https://colorhunt.co/ (Bảng màu đẹp)
- https://coolors.co/ (Generator)

Copy mã màu dạng `#RRGGBB` (ví dụ: `#dc2626`)

---

## 📱 Preview Nhanh

Không muốn sửa file? Test trực tiếp trong browser:

1. Mở website
2. Nhấn F12 > Console
3. Paste code:

```javascript
// Test theme Normal
applyPreset('normal');

// Test theme Christmas
applyPreset('christmas');

// Đổi text seasonal
document.querySelector('.seasonal-text').textContent = 'Text mới của bạn';
```

---

## ⚠️ Troubleshooting

### **Theme không đổi sau khi sửa file?**
1. Đảm bảo đã lưu file (Ctrl+S)
2. Hard refresh browser: Ctrl+Shift+R
3. Xóa cache browser

### **Hoa không hiện/ẩn?**
Kiểm tra:
```javascript
showFlowers: true,  // Phải là true (không có dấu ngoặc)
```

### **Màu sai?**
Đảm bảo format đúng:
```javascript
'#dc2626'  // ✅ Đúng
'dc2626'   // ❌ Sai (thiếu #)
'#DC2626'  // ✅ OK (hoa/thường đều được)
```

---

## 🎉 Tips & Tricks

1. **Dùng preset có sẵn** trước khi tự custom
2. **Backup file** trước khi sửa nhiều
3. **Test trong Console** trước khi sửa file
4. **Enable Auto Theme** để không phải nhớ đổi
5. **Chụp screenshot** theme cũ để tham khảo

---

## 📞 Need Help?

Gặp khó khăn? Email: icnlab@ptit.edu.vn

Hoặc mở file `theme-config.js` và đọc comments chi tiết!
