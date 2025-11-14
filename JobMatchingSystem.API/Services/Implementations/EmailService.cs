using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.Extensions.Options;
using System.Net.Mail;
using System.Net;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;

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
        public async Task SendResetPasswordEmailAsync(string toEmail, string resetLink)
        {
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
    }
}
