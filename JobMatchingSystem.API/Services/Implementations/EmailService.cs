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
    }
}
