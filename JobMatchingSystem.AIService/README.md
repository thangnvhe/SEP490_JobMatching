# 🤖 Job Matching AI Service

Dịch vụ AI cho hệ thống tuyển dụng, cung cấp các tính năng validation CV, trích xuất thông tin và matching công việc sử dụng Google Gemini AI.

## ✨ Tính năng chính

- 📋 **CV Validation**: Kiểm tra file PDF có phải là CV hợp lệ không
- 🔍 **Information Extraction**: Trích xuất thông tin từ CV (tên, email, kỹ năng, kinh nghiệm)
- 🎯 **Job Matching**: So sánh CV với mô tả công việc và tính điểm phù hợp
- 🔄 **Multi-model Fallback**: Hỗ trợ 11+ models Gemini với automatic failover
- 🧪 **Mock Mode**: Chế độ test khi AI service không khả dụng

## 🏗 Kiến trúc

```
JobMatchingSystem.AIService/
├── ai_service.py           # FastAPI main application
├── requirements.txt        # Python dependencies
├── .env.example           # Environment variables template
├── config/
│   └── config.py          # Configuration management
├── models/
│   └── schemas.py         # Pydantic response models
├── services/
│   └── cv_service.py      # Core CV processing logic
├── utils/
│   ├── pdf_processor.py   # PDF text extraction
│   └── gemini_client.py   # Gemini API client with fallback
└── prompts/
    └── cv_validation.py   # AI prompts for different tasks
```

## 🚀 Cài đặt và Chạy

### 1. Cài đặt Dependencies

```bash
pip install -r requirements.txt
```

### 2. Cấu hình Environment

⚠️ **QUAN TRỌNG: BẢO MẬT API KEY** ⚠️

```bash
# 1. Copy file mẫu
copy .env.example .env

# 2. Chỉnh sửa file .env với API key thực
GOOGLE_API_KEY=your_actual_gemini_api_key_here

# 3. Hoặc set trong PowerShell:
$env:GOOGLE_API_KEY="your_gemini_api_key_here"
```

**Lấy Google Gemini API Key:**
1. Truy cập [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Đăng nhập Google account
3. Nhấn "Create API Key" 
4. Copy key và paste vào file `.env`

### 3. Chạy Service

```bash
# Development mode
python ai_service.py

# Production mode with Uvicorn
uvicorn ai_service:app --host 0.0.0.0 --port 8000
```

Service sẽ chạy tại: `http://localhost:8000`

## 📖 API Documentation

### Health Check
```http
GET /
GET /health
GET /config  # Debug mode only
```

### CV Validation
```http
POST /validate_cv
Content-Type: multipart/form-data

Parameters:
- file: PDF file (max 10MB)

Response:
{
  "is_cv": true,
  "confidence": 0.85,
  "reason": "Document contains typical CV components",
  "file_info": {
    "filename": "cv.pdf",
    "file_size_mb": 1.2,
    "num_pages": 2
  }
}
```

### CV Information Extraction
```http
POST /extract_cv_info
Content-Type: multipart/form-data

Parameters:
- file: PDF CV file

Response:
{
  "name": "John Smith",
  "email": "john@example.com",
  "phone": "+84123456789",
  "skills": ["Python", "React", "SQL"],
  "experience_years": "3",
  "education": "Bachelor of Computer Science",
  "certifications": ["AWS Cloud Practitioner"],
  "languages": ["Vietnamese", "English"]
}
```

### Job Matching
```http
POST /match_cv_job
Content-Type: application/json

{
  "cv_text": "CV content...",
  "job_description": "Job requirements..."
}

Response:
{
  "match_score": 85,
  "matching_skills": ["Python", "React", "SQL"],
  "missing_skills": ["AWS", "Docker", "Kubernetes"],
  "overall_assessment": "Good match for this position",
  "recommendations": "Consider gaining experience with cloud technologies"
}
```

## 🛠 Cấu hình

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_API_KEY` | Google Gemini API key | Required |
| `GEMINI_MODEL` | Primary Gemini model | `models/gemini-2.5-flash` |
| `PDF_MAX_SIZE_MB` | Max PDF file size | `10` |
| `DEBUG_MODE` | Enable debug logging | `true` |
| `MOCK_MODE` | Use mock responses | `false` |
| `CV_CONFIDENCE_THRESHOLD` | Min confidence for CV validation | `0.7` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:3000,https://localhost:7044` |

### Fallback Models

Service hỗ trợ automatic failover qua 11+ Gemini models:
- `models/gemini-2.5-flash` (Primary)
- `models/gemini-2.5-pro`
- `models/gemini-2.0-flash`
- `models/gemini-2.0-flash-lite`
- `models/gemini-1.5-pro`
- `models/gemini-1.5-flash`
- Và nhiều models khác...

## 🧪 Testing

### Test API Key và Models
```bash
python check_gemini_api.py
```

### Test Specific Models
```bash
python test_gemini_2.py
```

### Test với cURL
```bash
# Health check
curl http://localhost:8000/health

# Upload CV để validate
curl -X POST "http://localhost:8000/validate_cv" \
     -H "accept: application/json" \
     -H "Content-Type: multipart/form-data" \
     -F "file=@path/to/cv.pdf"
```

## 🔗 Tích hợp với .NET API

### Thêm vào CVController.cs:
```csharp
[HttpPost("validate")]
public async Task<IActionResult> ValidateCV([FromForm] IFormFile file)
{
    try 
    {
        using var httpClient = new HttpClient();
        using var form = new MultipartFormDataContent();
        using var fileStream = file.OpenReadStream();
        using var streamContent = new StreamContent(fileStream);
        
        streamContent.Headers.ContentType = 
            new System.Net.Http.Headers.MediaTypeHeaderValue("application/pdf");
        form.Add(streamContent, "file", file.FileName);
        
        var response = await httpClient.PostAsync(
            "http://localhost:8000/validate_cv", form);
        
        if (response.IsSuccessStatusCode)
        {
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<CVValidationResponse>(content);
            return Ok(result);
        }
        
        return BadRequest("AI service unavailable");
    }
    catch (Exception ex)
    {
        return BadRequest($"Error: {ex.Message}");
    }
}
```

## 🚨 Bảo mật và Lưu ý

⚠️ **KHÔNG BAO GIỜ COMMIT FILE .env LÊN GITHUB!**

### Checklist bảo mật:
- ✅ File `.env` có trong `.gitignore`
- ✅ API keys được lưu trong environment variables
- ✅ File size limits (10MB for CVs)
- ✅ Content type validation (chỉ PDF)
- ✅ Error handling không expose sensitive info
- ✅ CORS configuration cho production

### Files cần giấu trong .gitignore:
- `.env`, `.env.*` - Chứa API keys
- `*.log` - Log files có thể chứa sensitive data
- `*.key`, `*.pem` - Certificate files
- `__pycache__/` - Python cache
- `data/`, `*.csv` - Potential sensitive data

## 🐛 Troubleshooting

### Gemini API Issues
```bash
# Kiểm tra API key và quota
python check_gemini_api.py

# Nếu quota exhausted, bật mock mode
# Trong .env: MOCK_MODE=true
```

### Common Errors
- **Port 8000 already in use**: Thay đổi port hoặc kill process
- **PDF processing failed**: Kiểm tra file size < 10MB và format hợp lệ
- **Connection refused**: Đảm bảo service đang chạy và firewall settings
- **CORS errors**: Cập nhật `CORS_ORIGINS` trong config

### Debug Mode
```bash
# Bật debug logging
export DEBUG_MODE=true  # Linux/Mac
$env:DEBUG_MODE="true"  # Windows

# Xem detailed logs
python ai_service.py
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. **Đảm bảo KHÔNG commit .env file**
5. Push và create Pull Request

### Development Guidelines
- Sử dụng type hints cho Python functions
- Thêm docstrings cho public methods
- Test với mock mode trước khi test với real API
- Update README.md nếu thêm features mới

---

**Phát triển bởi:** JobMatchingSystem Team  
**Version:** 1.0.0  
**License:** MIT

**Documentation:** `http://localhost:8000/docs` (Swagger UI)  
**Health Check:** `http://localhost:8000/health`
|----------|-------------|---------|
| GOOGLE_API_KEY | Google Gemini API key | - |
| GEMINI_MODEL | Gemini model name | models/gemini-2.0-flash-exp |
| PDF_MAX_SIZE_MB | Max PDF file size | 10 |
| DEBUG_MODE | Enable debug features | true |
| CORS_ORIGINS | Allowed CORS origins | * |