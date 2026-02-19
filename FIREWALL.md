# Hướng dẫn mở Firewall cho ICN Lab Website

## 🔥 Nếu không truy cập được từ máy khác trong LAN

### Cách 1: Tắt Firewall (Nhanh nhất - Chỉ dùng trong mạng nội bộ an toàn)

1. Mở **Windows Security**
2. Chọn **Firewall & network protection**
3. Chọn **Private network** hoặc **Domain network**
4. Tắt **Windows Defender Firewall**

### Cách 2: Mở cổng cụ thể (Khuyến nghị)

#### Bằng PowerShell (Admin):

```powershell
# Mở PowerShell as Administrator
# Chạy các lệnh sau:

# Cho phép Backend (port 5000)
New-NetFirewallRule -DisplayName "ICN Lab Backend" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow

# Cho phép Frontend (port 3000)
New-NetFirewallRule -DisplayName "ICN Lab Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow

# Cho phép Admin (port 3001)
New-NetFirewallRule -DisplayName "ICN Lab Admin" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
```

#### Bằng GUI:

1. Mở **Windows Defender Firewall**
2. Click **Advanced settings** (bên trái)
3. Click **Inbound Rules** > **New Rule...**
4. Chọn **Port** > Next
5. Chọn **TCP** > Nhập port: `5000` > Next
6. Chọn **Allow the connection** > Next
7. Check tất cả: Domain, Private, Public > Next
8. Đặt tên: `ICN Lab Backend` > Finish
9. Lặp lại cho port `3000` và `3001`

### Cách 3: Tạo file .bat tự động (Chạy as Administrator)

Tạo file `open-firewall.bat`:

```bat
@echo off
echo Opening Firewall ports for ICN Lab Website...

netsh advfirewall firewall add rule name="ICN Lab Backend" dir=in action=allow protocol=TCP localport=5000
netsh advfirewall firewall add rule name="ICN Lab Frontend" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="ICN Lab Admin" dir=in action=allow protocol=TCP localport=3001

echo.
echo Firewall rules added successfully!
echo You can now access the website from other devices.
pause
```

**Chạy file này as Administrator** (Right-click > Run as administrator)

## 🧪 Kiểm tra kết nối

Từ máy khác trong mạng LAN, mở browser và truy cập:

```
http://192.168.1.X:5000/api/health
```

(Thay `192.168.1.X` bằng IP thực của máy chạy server)

Nếu thấy JSON response thì đã OK!

## 🔍 Tìm IP address của máy

```powershell
ipconfig
```

Tìm dòng **IPv4 Address** (thường là `192.168.X.X`)

## ⚠️ Lưu ý

- Chỉ mở firewall trong mạng nội bộ tin cậy
- Không nên tắt hoàn toàn firewall khi kết nối Internet công cộng
- Sau khi xong, có thể xóa rules hoặc bật lại firewall
