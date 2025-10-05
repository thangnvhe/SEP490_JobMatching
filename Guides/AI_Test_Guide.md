# Test AI Ollama Integration - Quick Guide

## Tình trạng hiện tại ✅
- ✅ Ollama service đang chạy (port 11434)
- ✅ Model llama3.1:latest đã được cài đặt 
- ✅ Ứng dụng web đang chạy (localhost:5180)
- ✅ AI Service đã được implement

## Cách test ngay:

### 1. Test qua Browser
```
URL: http://localhost:5180/Admin/AITest
```
- Click "Kiểm tra kết nối" để test Ollama
- Click "Test phân tích CV" để test AI

### 2. Test qua API trực tiếp
```bash
# Test Ollama status
curl http://localhost:11434/api/tags

# Test AI generation
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model":"llama3.1","prompt":"Hello","stream":false}'
```

### 3. Test CV Analysis
```
URL: http://localhost:5180/Admin/CVAnalysis
```
- Upload file PDF CV để test phân tích
- Hoặc nhập text CV vào form

## Troubleshooting

### Nếu AI không hoạt động:
1. **Kiểm tra Ollama:**
   ```
   curl http://localhost:11434/api/tags
   ```

2. **Kiểm tra model:**
   - Phải có model "llama3.1:latest" trong response

3. **Kiểm tra logs ứng dụng:**
   - Xem terminal đang chạy dotnet run

### Nếu AI trả về lỗi:
- Kiểm tra appsettings.json: `"EnableAI": true`
- Kiểm tra URL Ollama: `"OllamaBaseUrl": "http://localhost:11434"`

## Test Results
Khi AI hoạt động đúng, bạn sẽ thấy:
- Connection test: ✅ "Kết nối thành công"
- CV Analysis: JSON với thông tin đã parse (tên, năm sinh, kỹ năng...)
- Excel export: File .xlsx với dữ liệu CV đã phân tích

## Next Steps
Sau khi test thành công, bạn có thể:
1. Upload PDF CV thật để test
2. Tùy chỉnh AI prompt trong AIService.cs
3. Thêm các field phân tích mới
4. Tích hợp với database để lưu kết quả