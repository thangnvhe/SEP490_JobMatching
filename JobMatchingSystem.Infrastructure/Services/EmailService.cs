using System.Net;
using System.Net.Mail;
using System.Text;
using JobMatchingSystem.Application.DTOs;
using JobMatchingSystem.Infrastructure.Configuration;
using JobMatchingSystem.Infrastructure.IServices;
using Microsoft.Extensions.Options;

namespace JobMatchingSystem.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _emailSettings;

        public EmailService(IOptions<EmailSettings> emailSettings)
        {
            _emailSettings = emailSettings.Value;
        }

        public async Task<ResponseModel> SendWelcomeEmailAsync(string toEmail, string userName, string confirmationLink)
        {
            var subject = "Welcome to JobMatching System!";
            var htmlBody = GetWelcomeEmailTemplate(userName, confirmationLink);
            var plainTextBody = $"Welcome {userName}! Please confirm your email by clicking: {confirmationLink}";
            
            return await SendEmailAsync(toEmail, subject, htmlBody, plainTextBody);
        }

        public async Task<ResponseModel> SendEmailConfirmationAsync(string toEmail, string userName, string confirmationLink)
        {
            var subject = "Confirm Your Email Address";
            var htmlBody = GetEmailConfirmationTemplate(userName, confirmationLink);
            var plainTextBody = $"Hello {userName}, please confirm your email address by clicking: {confirmationLink}";
            
            return await SendEmailAsync(toEmail, subject, htmlBody, plainTextBody);
        }

        public async Task<ResponseModel> SendPasswordResetEmailAsync(string toEmail, string userName, string resetLink)
        {
            var subject = "Reset Your Password";
            var htmlBody = GetPasswordResetTemplate(userName, resetLink);
            var plainTextBody = $"Hello {userName}, reset your password by clicking: {resetLink}";
            
            return await SendEmailAsync(toEmail, subject, htmlBody, plainTextBody);
        }

        public async Task<ResponseModel> SendJobStatusUpdateEmailAsync(string toEmail, string candidateName, string jobTitle, string companyName, string status, string? message = null)
        {
            var subject = $"Application Update: {jobTitle} at {companyName}";
            var htmlBody = GetJobStatusUpdateTemplate(candidateName, jobTitle, companyName, status, message);
            var plainTextBody = $"Hello {candidateName}, your application for {jobTitle} at {companyName} has been updated to: {status}";
            
            return await SendEmailAsync(toEmail, subject, htmlBody, plainTextBody);
        }

        public async Task<ResponseModel> SendCustomEmailAsync(string toEmail, string subject, string htmlBody, string? plainTextBody = null)
        {
            return await SendEmailAsync(toEmail, subject, htmlBody, plainTextBody);
        }

        private async Task<ResponseModel> SendEmailAsync(string toEmail, string subject, string htmlBody, string? plainTextBody = null)
        {
            try
            {
                using var client = new SmtpClient(_emailSettings.SmtpServer, _emailSettings.SmtpPort)
                {
                    Credentials = new NetworkCredential(_emailSettings.Username, _emailSettings.Password),
                    EnableSsl = _emailSettings.EnableSsl
                };

                using var mailMessage = new MailMessage
                {
                    From = new MailAddress(_emailSettings.SenderEmail, _emailSettings.SenderName),
                    Subject = subject,
                    Body = htmlBody,
                    IsBodyHtml = true
                };

                mailMessage.To.Add(toEmail);

                if (!string.IsNullOrEmpty(plainTextBody))
                {
                    var plainView = AlternateView.CreateAlternateViewFromString(plainTextBody, Encoding.UTF8, "text/plain");
                    mailMessage.AlternateViews.Add(plainView);
                }

                await client.SendMailAsync(mailMessage);
                return new ResponseModel { Success = true, Message = "Email sent successfully" };
            }
            catch (Exception ex)
            {
                return new ResponseModel { Success = false, Message = $"Failed to send email: {ex.Message}" };
            }
        }

        private string GetWelcomeEmailTemplate(string userName, string confirmationLink)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <title>Welcome to JobMatching System</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 30px; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .btn {{ display: inline-block; background: #667eea; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 15px 0; }}
        .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='header'>
        <h1>🎉 Welcome to JobMatching System!</h1>
    </div>
    <div class='content'>
        <h2>Hello {userName}!</h2>
        <p>We're thrilled to have you join our community of professionals. JobMatching System connects talented individuals with amazing career opportunities.</p>
        
        <p>To get started, please confirm your email address by clicking the button below:</p>
        
        <a href='{confirmationLink}' class='btn'>Confirm My Email</a>
        
        <p>Once confirmed, you'll be able to:</p>
        <ul>
            <li>✅ Browse and apply for jobs</li>
            <li>✅ Upload and manage your CV</li>
            <li>✅ Receive job recommendations</li>
            <li>✅ Connect with recruiters</li>
        </ul>
        
        <p>If you have any questions, feel free to reach out to our support team.</p>
        
        <p>Best regards,<br>The JobMatching Team</p>
    </div>
    <div class='footer'>
        <p>© 2025 JobMatching System. All rights reserved.</p>
    </div>
</body>
</html>";
        }

        private string GetEmailConfirmationTemplate(string userName, string confirmationLink)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <title>Confirm Your Email</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #28a745; color: white; text-align: center; padding: 30px; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .btn {{ display: inline-block; background: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 15px 0; }}
        .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='header'>
        <h1>📧 Email Confirmation</h1>
    </div>
    <div class='content'>
        <h2>Hello {userName}!</h2>
        <p>Please confirm your email address to complete your registration and start using JobMatching System.</p>
        
        <a href='{confirmationLink}' class='btn'>Confirm Email Address</a>
        
        <p>This link will expire in 24 hours for security purposes.</p>
        
        <p>If you didn't create an account, please ignore this email.</p>
        
        <p>Best regards,<br>The JobMatching Team</p>
    </div>
    <div class='footer'>
        <p>© 2025 JobMatching System. All rights reserved.</p>
    </div>
</body>
</html>";
        }

        private string GetPasswordResetTemplate(string userName, string resetLink)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <title>Reset Your Password</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #dc3545; color: white; text-align: center; padding: 30px; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .btn {{ display: inline-block; background: #dc3545; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 15px 0; }}
        .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 12px; }}
        .warning {{ background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }}
    </style>
</head>
<body>
    <div class='header'>
        <h1>🔒 Password Reset</h1>
    </div>
    <div class='content'>
        <h2>Hello {userName}!</h2>
        <p>We received a request to reset your password for your JobMatching System account.</p>
        
        <a href='{resetLink}' class='btn'>Reset My Password</a>
        
        <div class='warning'>
            <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request this reset, please ignore this email and your password will remain unchanged.
        </div>
        
        <p>For your security, never share this link with anyone.</p>
        
        <p>Best regards,<br>The JobMatching Team</p>
    </div>
    <div class='footer'>
        <p>© 2025 JobMatching System. All rights reserved.</p>
    </div>
</body>
</html>";
        }

        private string GetJobStatusUpdateTemplate(string candidateName, string jobTitle, string companyName, string status, string? message)
        {
            var statusColor = status.ToLower() switch
            {
                "accepted" or "hired" => "#28a745",
                "rejected" or "declined" => "#dc3545",
                "interview" or "shortlisted" => "#ffc107",
                _ => "#17a2b8"
            };

            var statusEmoji = status.ToLower() switch
            {
                "accepted" or "hired" => "🎉",
                "rejected" or "declined" => "😔",
                "interview" or "shortlisted" => "📞",
                _ => "📋"
            };

            var additionalMessage = !string.IsNullOrEmpty(message) ? $"<div class='message'><p><strong>Message from {companyName}:</strong></p><p>\"{message}\"</p></div>" : "";

            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <title>Application Status Update</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: {statusColor}; color: white; text-align: center; padding: 30px; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .status-badge {{ display: inline-block; background: {statusColor}; color: white; padding: 8px 15px; border-radius: 20px; font-weight: bold; margin: 10px 0; }}
        .job-details {{ background: white; padding: 20px; border-radius: 5px; margin: 15px 0; border-left: 4px solid {statusColor}; }}
        .message {{ background: #e9ecef; padding: 15px; border-radius: 5px; margin: 15px 0; font-style: italic; }}
        .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='header'>
        <h1>{statusEmoji} Application Status Update</h1>
    </div>
    <div class='content'>
        <h2>Hello {candidateName}!</h2>
        <p>We have an update regarding your application:</p>
        
        <div class='job-details'>
            <h3>{jobTitle}</h3>
            <p><strong>Company:</strong> {companyName}</p>
            <p><strong>Status:</strong> <span class='status-badge'>{status}</span></p>
        </div>
        
        {additionalMessage}
        
        <p>Thank you for your interest in this position. Please log in to your account to view more details and next steps.</p>
        
        <p>Best of luck with your job search!</p>
        
        <p>Best regards,<br>The JobMatching Team</p>
    </div>
    <div class='footer'>
        <p>© 2025 JobMatching System. All rights reserved.</p>
    </div>
</body>
</html>";
        }
    }
}
