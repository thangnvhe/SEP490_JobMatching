# Hướng dẫn quản lý Ollama Service

## Kiểm tra trạng thái Ollama

### Xem process đang chạy:
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*ollama*"}
```

### Kiểm tra service:
```powershell
curl http://localhost:11434/api/tags
```

## Tắt Ollama

### Cách 1: Tắt từ System Tray
- Tìm icon Ollama trong system tray (góc dưới bên phải)
- Right click → Quit

### Cách 2: Tắt bằng Task Manager
- Ctrl + Shift + Esc → mở Task Manager
- Tìm "ollama" processes → End task

### Cách 3: Tắt bằng PowerShell
```powershell
# Tắt tất cả Ollama processes
Get-Process ollama* | Stop-Process -Force
```

### Cách 4: Tắt service (nếu cài như service)
```powershell
# Kiểm tra service
Get-Service | Where-Object {$_.Name -like "*ollama*"}

# Tắt service
Stop-Service "Ollama"
```

## Khởi động Ollama

### Cách 1: Từ Start Menu
- Start → Tìm "Ollama" → Click để chạy

### Cách 2: Command line
```powershell
# Nếu ollama trong PATH
ollama serve

# Hoặc chạy từ folder cài đặt
& "C:\Users\$env:USERNAME\AppData\Local\Programs\Ollama\ollama.exe" serve
```

### Cách 3: Tự động khởi động với Windows
- Ollama thường tự động start với Windows
- Có thể disable trong Task Manager → Startup

## Kiểm tra tài nguyên Ollama sử dụng

```powershell
# Xem RAM usage
Get-Process ollama* | Select-Object ProcessName, WorkingSet, CPU

# Xem network ports
netstat -ano | findstr 11434
```

## Khuyến nghị

### ✅ Nên để chạy khi:
- Đang phát triển AI features
- Máy có RAM > 8GB
- Sử dụng AI thường xuyên

### ❌ Nên tắt khi:
- Máy yếu (< 4GB RAM)
- Không dùng AI > 1 tuần
- Cần tiết kiệm pin laptop

### ⚙️ Tự động hóa:
- Có thể tạo batch script để bật/tắt nhanh
- Hoặc schedule task để tự động quản lý

## Troubleshooting

### Nếu Ollama không tắt được:
```powershell
# Force kill tất cả
taskkill /f /im ollama.exe
```

### Nếu không khởi động được:
1. Kiểm tra port 11434 có bị chiếm không
2. Chạy lại installer Ollama
3. Restart máy

Với dự án hiện tại, bạn có thể để Ollama chạy để test AI service tiện hơn!