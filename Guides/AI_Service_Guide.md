# Hướng dẫn sử dụng AI Service cho phân tích CV

## Tổng quan
AI Service đã được tạo thành công với các tính năng:
- Trích xuất text từ file PDF
- Phân tích CV bằng AI (Ollama/LLama 3.1)  
- Xuất kết quả ra file Excel
- Hỗ trợ phân tích hàng loạt

## Cấu trúc đã tạo

### 1. Models (CVAnalysisModels.cs)
- `CVAnalysisResult`: Chứa tất cả thông tin phân tích
- `EducationInfo`: Thông tin học vấn
- `ExperienceInfo`: Thông tin kinh nghiệm làm việc  
- `ProjectInfo`: Thông tin dự án

### 2. Configuration (AISettings.cs)
```json
{
  "AISettings": {
    "OllamaBaseUrl": "http://localhost:11434",
    "DefaultModel": "llama3.1", 
    "TimeoutSeconds": 300,
    "EnableAI": true
  }
}
```

### 3. Services
- `IAIService`: Interface định nghĩa các method
- `AIService`: Implementation chính với các tính năng:
  - `ExtractTextFromPDFAsync()`: Trích xuất text từ PDF
  - `AnalyzeCVFromTextAsync()`: Phân tích CV bằng AI
  - `AnalyzeCVFromPDFAsync()`: Phân tích trực tiếp từ PDF
  - `ExportCVAnalysisToExcelAsync()`: Xuất Excel

### 4. Controller (CVAnalysisController.cs)
- Upload và phân tích CV đơn lẻ
- Phân tích hàng loạt nhiều file
- Xuất kết quả ra Excel
- Download file Excel mẫu

### 5. Views
- `Index.cshtml`: Giao diện upload file
- `AnalysisResult.cshtml`: Hiển thị kết quả phân tích

## Cài đặt Ollama (để sử dụng AI)

### Bước 1: Cài đặt Ollama
```bash
# Windows: Tải từ https://ollama.ai/download
# Sau khi cài xong, mở Command Prompt/PowerShell
```

### Bước 2: Cài model LLama 3.1
```bash
ollama pull llama3.1
```

### Bước 3: Khởi động Ollama service
```bash
ollama serve
```

### Bước 4: Test Ollama
```bash
ollama run llama3.1
# Nhập câu hỏi để test: "Hello, how are you?"
```

## Sử dụng

### 1. Truy cập giao diện
- URL: `/Admin/CVAnalysis`
- Chọn file PDF CV để phân tích
- Hoặc chọn nhiều file để phân tích hàng loạt

### 2. Kết quả nhận được
AI sẽ phân tích và trích xuất:
- Thông tin cá nhân (tên, năm sinh, giới tính, liên hệ)
- Học vấn (trường, bằng cấp, chuyên ngành, năm tốt nghiệp)
- Kỹ năng (technical skills, soft skills)
- Kinh nghiệm làm việc (công ty, vị trí, thời gian, trách nhiệm)
- Dự án (tên dự án, công nghệ, vai trò)
- Thành tựu

### 3. Xuất Excel
- Tất cả kết quả có thể xuất ra file Excel
- Format chuẩn với các cột được định nghĩa sẵn
- Hỗ trợ xuất hàng loạt nhiều CV

## Lưu ý
- Nếu chưa cài Ollama, hệ thống vẫn hoạt động nhưng chỉ trích xuất text
- File PDF phải có text (không phải scan ảnh)
- Kích thước file tối đa: 5MB
- AI prompt được tối ưu cho tiếng Việt

## Test đã hoàn thành
- ✅ 4/4 unit tests pass
- ✅ Build thành công không lỗi
- ✅ Service registration trong Program.cs
- ✅ Configuration trong appsettings.json

Bạn có thể bắt đầu test ngay bằng cách chạy ứng dụng và truy cập `/Admin/CVAnalysis`!