using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.Extensions.Options;
using System.Net.Mail;
using System.Net;
using OfficeOpenXml.FormulaParsing.LexicalAnalysis;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;
        private readonly string _frontendBaseUrl = "http://localhost:5173";

        public EmailService(IOptions<EmailSettings> options)
        {
            _settings = options.Value;
        }
        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var message = new MailMessage();
            message.From = new MailAddress(_settings.SenderEmail, _settings.SenderName);
            message.To.Add(toEmail);
            message.Subject = subject;
            message.Body = body;
            message.IsBodyHtml = true;

            using var client = new SmtpClient(_settings.SmtpServer, _settings.SmtpPort)
            {
                Credentials = new NetworkCredential(_settings.Username, _settings.Password),
                EnableSsl = _settings.EnableSsl
            };

            await client.SendMailAsync(message);
        }
        public async Task SendResetPasswordEmailAsync(string toEmail, string token)
        {
            string resetLink = $"{_frontendBaseUrl}/reset-password?token={token}&email={toEmail}";
            string subject = "Yêu cầu đặt lại mật khẩu - JobMatching System";

            string body = $@"
        <h2>Đặt lại mật khẩu của bạn</h2>
        <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
        <p>Nhấn vào nút bên dưới để đặt lại mật khẩu:</p>
        <a href='{resetLink}' 
           style='display:inline-block; padding:10px 20px; background-color:#007bff; color:#fff; border-radius:5px; text-decoration:none;'>
           Đặt lại mật khẩu
        </a>
        <p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email.</p>
        ";

            await SendEmailAsync(toEmail, subject, body);
        }
        public async Task SendEmailConfirmationAsync(string toEmail, string fullName, string token)
        {
            // Tiêu đề email
            string subject = "Xác nhận email - JobMatching System";

            // Link xác nhận email (frontend sẽ nhận token này để gọi API Verify)
            string confirmationUrl = $"{_frontendBaseUrl}/confirm-email?token={token}";

            // Nội dung email (HTML)
            string body = $@"
        <h2>Chào {fullName}</h2>
        <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng nhấn vào nút bên dưới để xác nhận email:</p>
        <a href='{confirmationUrl}' 
           style='display:inline-block; padding:10px 20px; background-color:#28a745; color:#fff; border-radius:5px; text-decoration:none;'>
           Xác nhận email
        </a>
        <p>Nếu bạn không đăng ký, hãy bỏ qua email này.</p>
    ";

            // Gửi email sử dụng hàm SendEmailAsync có sẵn
            await SendEmailAsync(toEmail, subject, body);

        }
        public async Task SendWelcomeEmailAsync(string toEmail, string fullName)
        {
            string subject = "Chào mừng đến với JobMatching System!";

            string body = $@"
        <h2>Chào {fullName},</h2>
        <p>Chúc mừng! Email của bạn đã được xác nhận thành công.</p>
        <p>Bây giờ bạn có thể đăng nhập và bắt đầu khám phá các cơ hội việc làm trên hệ thống.</p>
        <p>Cảm ơn bạn đã đăng ký!</p>
        <hr>
        <p>JobMatching System Team</p>
    ";

            // Gọi hàm gửi email chung
            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendCompanyApprovedEmailAsync(string toEmail, string fullName, string token, string companyName)
        {
            string resetLink = $"{_frontendBaseUrl}/reset-password?token={token}&email={toEmail}";
            string subject = "Công ty của bạn đã được duyệt - JobMatching System";

            string body = $@"
    <h2>Chào {WebUtility.HtmlEncode(fullName)}</h2>
    <p>Xin chúc mừng! Công ty <strong>{WebUtility.HtmlEncode(companyName)}</strong> của bạn đã được duyệt.</p>
    <p>Để hoàn tất việc kích hoạt tài khoản recruiter và đặt mật khẩu, vui lòng nhấn vào nút bên dưới:</p>
    <a href='{resetLink}' 
       style='display:inline-block; padding:10px 20px; background-color:#007bff; color:#fff; border-radius:5px; text-decoration:none;'>
       Đặt mật khẩu và đăng nhập
    </a>
    <p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
    ";

            await SendEmailAsync(toEmail, subject, body);
        }
        public async Task SendCompanyRejectedEmailAsync(string toEmail, string fullName, string companyName, string rejectReason)
        {
            string subject = "Công ty của bạn đã bị từ chối - JobMatching System";

            string body = $@"
        <h2>Chào {WebUtility.HtmlEncode(fullName)}</h2>
        <p>Rất tiếc! Công ty <strong>{WebUtility.HtmlEncode(companyName)}</strong> của bạn đã bị từ chối đăng ký.</p>
        <p>Lý do từ chối: {WebUtility.HtmlEncode(rejectReason)}</p>
        <p>Vui lòng liên hệ bộ phận hỗ trợ nếu bạn có thắc mắc.</p>
        <hr>
        <p>JobMatching System Team</p>
    ";

            await SendEmailAsync(toEmail, subject, body);
        }
        public async Task SendHmPasswordEmailAsync(string toEmail, string fullName, string password)
        {
            string subject = "Tài khoản Hiring Manager - JobMatching System";

            string body = $@"
    <h2>Chào {WebUtility.HtmlEncode(fullName)}</h2>
    <p>Tài khoản Hiring Manager của bạn đã được tạo thành công.</p>
    <p>Thông tin đăng nhập:</p>
    <ul>
        <li>Email: {WebUtility.HtmlEncode(toEmail)}</li>
        <li>Mật khẩu: <strong>{WebUtility.HtmlEncode(password)}</strong></li>
    </ul>
    <p>Vui lòng đăng nhập và thay đổi mật khẩu ngay sau lần đầu đăng nhập.</p>
    <hr>
    <p>JobMatching System Team</p>
    ";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendJobClosedNotificationAsync(string toEmail, string candidateName, string jobTitle, string companyName)
        {
            string subject = "Thông báo: Vị trí công việc đã bị đóng - JobMatching System";

            string body = $@"
    <h2>Chào {WebUtility.HtmlEncode(candidateName)}</h2>
    <p>Chúng tôi rất tiếc phải thông báo rằng vị trí công việc mà bạn đã ứng tuyển đã bị đóng.</p>
    <div style='background-color:#f8f9fa; padding:15px; border-left:4px solid #dc3545; margin:20px 0;'>
        <h3>Chi tiết vị trí:</h3>
        <p><strong>Tên công việc:</strong> {WebUtility.HtmlEncode(jobTitle)}</p>
        <p><strong>Công ty:</strong> {WebUtility.HtmlEncode(companyName)}</p>
        <p><strong>Trạng thái:</strong> Đã đóng</p>
    </div>
    <p>Lý do đóng: Nhà tuyển dụng phụ trách vị trí này đã ngừng hoạt động trên hệ thống.</p>
    <p>Chúng tôi khuyến khích bạn tiếp tục tìm kiếm các cơ hội việc làm khác trên JobMatching System.</p>
    <hr>
    <p>Cảm ơn bạn đã sử dụng JobMatching System!</p>
    <p>JobMatching System Team</p>
    ";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendCompanyClosedNotificationAsync(string toEmail, string candidateName, string jobTitle, string companyName)
        {
            string subject = "Thông báo: Công ty ngừng hoạt động - JobMatching System";

            string body = $@"
    <h2>Chào {WebUtility.HtmlEncode(candidateName)}</h2>
    <p>Chúng tôi rất tiếc phải thông báo rằng công ty mà bạn đã ứng tuyển đã ngừng hoạt động trên hệ thống.</p>
    <div style='background-color:#f8f9fa; padding:15px; border-left:4px solid:#dc3545; margin:20px 0;'>
        <h3>Chi tiết:</h3>
        <p><strong>Tên công việc:</strong> {WebUtility.HtmlEncode(jobTitle)}</p>
        <p><strong>Công ty:</strong> {WebUtility.HtmlEncode(companyName)}</p>
        <p><strong>Trạng thái:</strong> Công ty ngừng hoạt động</p>
    </div>
    <p>Do công ty này đã ngừng hoạt động trên hệ thống JobMatching, tất cả các vị trí tuyển dụng của họ đã được đóng.</p>
    <p>Chúng tôi khuyến khích bạn tiếp tục tìm kiếm các cơ hội việc làm khác từ những công ty đang hoạt động trên JobMatching System.</p>
    <p style='color:#28a745; font-weight:bold;'>💼 Hãy khám phá thêm nhiều cơ hội việc làm tuyệt vời khác trên hệ thống của chúng tôi!</p>
    <hr>
    <p>Cảm ơn bạn đã sử dụng JobMatching System!</p>
    <p>JobMatching System Team</p>
    ";

            await SendEmailAsync(toEmail, subject, body);
        }
    }
}
