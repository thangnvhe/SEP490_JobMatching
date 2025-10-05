# CV Template Generator - Hướng dẫn sử dụng

## Tổng quan
Hệ thống CV Template Generator cho phép tạo CV chuyên nghiệp từ các template có sẵn. Người dùng có thể:
- Chọn template từ thư viện có sẵn
- Nhập thông tin cá nhân 
- Tạo CV dưới dạng hình ảnh PNG
- Tải xuống CV đã tạo

## Cấu trúc thư mục

```
JobMatchingSystem.UI/
├── wwwroot/
│   └── TemplateCV/           # Thư mục chứa template images
│       ├── template1.png     # Template Professional Classic
│       ├── template2.png     # Template Modern Minimalist
│       ├── template3.png     # Template Creative Designer
│       ├── template4.png     # Template Corporate Standard
│       └── template5.png     # Template Tech Developer
└── Areas/Admin/
    ├── Controllers/
    │   └── CVTemplateController.cs
    └── Views/CVTemplate/
        ├── Index.cshtml      # Danh sách templates
        ├── Generate.cshtml   # Form nhập thông tin CV
        └── QuickTest.cshtml  # Form test nhanh
```

## Models & Services

### CVTemplateData
```csharp
public class CVTemplateData
{
    public string FullName { get; set; }        // Họ tên
    public string JobTitle { get; set; }        // Vị trí công việc
    public string Email { get; set; }           // Email
    public string PhoneNumber { get; set; }     // Số điện thoại
    public string Address { get; set; }         // Địa chỉ
    public string Summary { get; set; }         // Tóm tắt bản thân
    public string Skills { get; set; }          // Kỹ năng
    public string Education { get; set; }       // Học vấn
    public string Experience { get; set; }      // Kinh nghiệm
    public string Projects { get; set; }        // Dự án
    public string Achievements { get; set; }    // Thành tựu
    public string Languages { get; set; }       // Ngôn ngữ
    public string Hobbies { get; set; }         // Sở thích
}
```

### CVTemplate & Positioning
- Mỗi template có style riêng định nghĩa vị trí của từng thành phần
- Text được vẽ lên template bằng System.Drawing.Graphics
- Hỗ trợ custom font, color, alignment cho từng template

## Sử dụng

### 1. Truy cập giao diện
```
URL: /Admin/CVTemplate
```

### 2. Các chức năng chính

#### Preview Template
- Xem template gốc không có dữ liệu
- Hiểu layout và style của template

#### Tùy chỉnh CV (Generate)
- Nhập đầy đủ thông tin cá nhân
- Validation dữ liệu đầu vào
- Tạo CV với thông tin thật

#### Tải mẫu (Sample)
- Tạo CV với dữ liệu mẫu để demo
- Nhanh chóng xem kết quả template

#### Quick Test
- Form đơn giản với các field cơ bản
- Test nhanh template với ít thông tin

### 3. Workflow tạo CV
1. **Chọn template** từ danh sách có sẵn
2. **Nhập thông tin** trong form tùy chỉnh
3. **Validate dữ liệu** (tự động)
4. **Tạo CV** - hệ thống vẽ text lên template
5. **Tải xuống** file PNG

## Templates có sẵn

### Template 1: Professional Classic
- **Màu chủ đạo:** #2C3E50 (Dark Blue)
- **Font:** Arial
- **Style:** Traditional, formal layout
- **Phù hợp:** Corporate, business roles

### Template 2: Modern Minimalist  
- **Màu chủ đạo:** #3498DB (Blue)
- **Font:** Calibri
- **Style:** Clean, centered layout
- **Phù hợp:** Modern professionals, startups

### Template 3-5: Creative, Corporate, Tech
- Các template khác với style riêng biệt
- Tùy chỉnh color scheme và layout

## Kỹ thuật Implementation

### Text Positioning System
```csharp
public class TextPosition
{
    public int X, Y;              // Tọa độ
    public int Width, Height;     // Kích thước vùng text
    public int FontSize;          // Cỡ font
    public string TextAlign;      // Left, Center, Right
}
```

### Image Generation Process
1. Load template image từ file
2. Tạo Graphics object từ image
3. Vẽ từng thành phần text theo position đã định nghĩa
4. Apply font, color, alignment
5. Convert bitmap thành byte array
6. Return file PNG

### Validation & Error Handling
- Validate required fields (Name, Email, Phone, Skills)
- Check email format
- Handle file not found errors
- Graceful fallback cho missing templates

## API Endpoints

```csharp
GET  /Admin/CVTemplate                          // Danh sách templates
GET  /Admin/CVTemplate/Preview/{templateId}     // Preview template
GET  /Admin/CVTemplate/Generate/{templateId}    // Form tạo CV
POST /Admin/CVTemplate/Generate/{templateId}    // Tạo CV từ form data
GET  /Admin/CVTemplate/GenerateSample/{templateId} // Tạo CV mẫu
GET  /Admin/CVTemplate/GetTemplatePreview/{templateId} // API lấy preview image
POST /Admin/CVTemplate/ValidateData             // Validate CV data
GET  /Admin/CVTemplate/QuickTest                // Form test nhanh
POST /Admin/CVTemplate/QuickGenerate            // Tạo CV từ form test nhanh
```

## Tương lai mở rộng

### Tính năng có thể thêm:
- **Avatar upload:** Thêm ảnh đại diện vào CV
- **Multiple templates:** Hỗ trợ nhiều page template
- **PDF export:** Xuất CV dưới dạng PDF thay vì PNG
- **Template editor:** Công cụ visual để tùy chỉnh vị trí text
- **Database templates:** Lưu template config trong database
- **User templates:** Cho phép user tạo template riêng
- **Batch generation:** Tạo nhiều CV từ Excel/CSV data

### Technical improvements:
- **Async image processing:** Xử lý ảnh không đồng bộ
- **Image caching:** Cache template images
- **Template versioning:** Version control cho templates
- **Cloud storage:** Lưu CV generated lên cloud
- **Preview API:** Real-time preview khi user nhập data

## Troubleshooting

### Lỗi thường gặp:
1. **Template not found:** Kiểm tra file template trong wwwroot/TemplateCV/
2. **Font not available:** Kiểm tra font được cài đặt trên server
3. **Image generation failed:** Kiểm tra System.Drawing.Common package
4. **Position overflow:** Text quá dài so với kích thước vùng định nghĩa

### Debug tips:
- Check template file exists
- Validate TextPosition coordinates
- Test với dữ liệu ngắn trước
- Check server logs cho detailed errors

Hệ thống CV Template Generator đã sẵn sàng sử dụng!