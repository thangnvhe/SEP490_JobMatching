# Email Service Setup và Usage Guide

## Tổng quan
JobMatchingSystem.Infrastructure.Services.EmailService cung cấp các chức năng gửi email cho hệ thống tuyển dụng, bao gồm:

- **Welcome Email**: Email chào mừng người dùng mới đăng ký
- **Email Confirmation**: Email xác nhận địa chỉ email
- **Password Reset**: Email reset mật khẩu  
- **Job Status Update**: Email thông báo thay đổi trạng thái ứng tuyển
- **Custom Email**: Gửi email tùy chỉnh

## Cấu hình

### 1. Trong appsettings.json:
```json
{
  "EmailSettings": {
    "SmtpServer": "smtp.gmail.com",
    "SmtpPort": 587,
    "SenderEmail": "your-email@gmail.com", 
    "SenderName": "JobMatching System",
    "Username": "your-email@gmail.com",
    "Password": "your-app-password",
    "EnableSsl": true
  }
}
```

### 2. Dependency Injection (Program.cs):
```csharp
using JobMatchingSystem.Infrastructure.Configuration;
using JobMatchingSystem.Infrastructure.IServices;
using JobMatchingSystem.Infrastructure.Services;

// Configure EmailSettings
builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection("EmailSettings"));

// Register EmailService
builder.Services.AddScoped<IEmailService, EmailService>();
```

## Cấu hình Gmail SMTP

### Bước 1: Bật 2-Step Verification
1. Vào [Google Account Settings](https://myaccount.google.com/)
2. Security → 2-Step Verification → Enable

### Bước 2: Tạo App Password
1. Security → App passwords
2. Chọn app: Mail
3. Copy app password (16 ký tự)
4. Sử dụng app password này trong `appsettings.json`

### Bước 3: Cấu hình SMTP
- **SMTP Server**: smtp.gmail.com
- **Port**: 587 (TLS) hoặc 465 (SSL)
- **EnableSsl**: true
- **Username**: Địa chỉ Gmail của bạn
- **Password**: App password (không phải mật khẩu Gmail)

## Sử dụng trong Controller

```csharp
public class AccountController : Controller
{
    private readonly IEmailService _emailService;
    
    public AccountController(IEmailService emailService)
    {
        _emailService = emailService;
    }
    
    [HttpPost]
    public async Task<IActionResult> Register(RegisterModel model)
    {
        // Logic đăng ký user...
        
        // Gửi welcome email + email confirmation
        var confirmationLink = Url.Action("ConfirmEmail", "Account", 
            new { token = confirmationToken, email = model.Email }, Request.Scheme);
            
        var result = await _emailService.SendWelcomeEmailAsync(
            model.Email, 
            model.FullName, 
            confirmationLink);
            
        if (!result.Success)
        {
            // Handle email sending failure
            _logger.LogError($"Failed to send welcome email: {result.Message}");
        }
        
        return View("RegisterSuccess");
    }
}
```

## Các Template Email

### 1. Welcome Email
- **Màu sắc**: Gradient tím xanh
- **Nội dung**: Chào mừng + link xác nhận email
- **Call-to-action**: "Confirm My Email"

### 2. Email Confirmation  
- **Màu sắc**: Xanh lá
- **Nội dung**: Yêu cầu xác nhận email
- **Thời hạn**: 24 giờ
- **Call-to-action**: "Confirm Email Address"

### 3. Password Reset
- **Màu sắc**: Đỏ
- **Nội dung**: Link reset password + cảnh báo bảo mật
- **Thời hạn**: 1 giờ  
- **Call-to-action**: "Reset My Password"

### 4. Job Status Update
- **Màu sắc**: Động theo trạng thái
  - `accepted/hired`: Xanh lá (#28a745) 🎉
  - `rejected/declined`: Đỏ (#dc3545) 😔
  - `interview/shortlisted`: Vàng (#ffc107) 📞
  - Khác: Xanh dương (#17a2b8) 📋
- **Nội dung**: Thông tin job + trạng thái + message tùy chọn

## Ví dụ Sử dụng

### Welcome Email
```csharp
var result = await _emailService.SendWelcomeEmailAsync(
    "user@example.com",
    "John Doe", 
    "https://yoursite.com/confirm?token=abc123");
```

### Job Status Update
```csharp
var result = await _emailService.SendJobStatusUpdateEmailAsync(
    "candidate@example.com",
    "Jane Smith",
    "Senior Developer", 
    "Tech Corp",
    "interview",
    "Congratulations! Please schedule your interview.");
```

### Password Reset
```csharp
var result = await _emailService.SendPasswordResetEmailAsync(
    "user@example.com",
    "John Doe",
    "https://yoursite.com/reset?token=xyz789");
```

## Testing

Project có 20 unit tests bao gồm:
- Template generation tests
- SMTP failure handling  
- Email validation
- Status color mapping
- Message handling (null/empty)

```bash
dotnet test JobMatchingSystem.UnitTest
```

## Security Best Practices

1. **Không commit credentials**: Sử dụng User Secrets hoặc Environment Variables
2. **App Passwords**: Luôn dùng app password thay vì mật khẩu thật
3. **HTTPS**: Chỉ gửi links HTTPS trong email
4. **Token expiration**: Đặt thời hạn cho confirmation/reset tokens
5. **Rate limiting**: Giới hạn số email gửi mỗi IP/user

## Troubleshooting

### Lỗi thường gặp:
1. **"Authentication failed"**: Kiểm tra app password
2. **"SMTP server not found"**: Kiểm tra SMTP server và port  
3. **"SSL/TLS error"**: Đảm bảo EnableSsl = true
4. **"Timeout"**: Kiểm tra firewall/proxy settings

### Debug logging:
```csharp
services.AddLogging(builder => builder.AddConsole());
```

## Mở rộng

Có thể thêm:
- Email templates từ database
- Multi-language support
- Email queuing system (Hangfire)
- Email tracking (opens, clicks)
- Unsubscribe functionality
- Rich text editor cho admin