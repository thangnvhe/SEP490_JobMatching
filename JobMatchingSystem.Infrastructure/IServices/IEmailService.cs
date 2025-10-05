using JobMatchingSystem.Application.DTOs;

namespace JobMatchingSystem.Infrastructure.IServices
{
    public interface IEmailService
    {
        Task<ResponseModel> SendWelcomeEmailAsync(string toEmail, string userName, string confirmationLink);
        Task<ResponseModel> SendEmailConfirmationAsync(string toEmail, string userName, string confirmationLink);
        Task<ResponseModel> SendPasswordResetEmailAsync(string toEmail, string userName, string resetLink);
        Task<ResponseModel> SendJobStatusUpdateEmailAsync(string toEmail, string candidateName, string jobTitle, string companyName, string status, string? message = null);
        Task<ResponseModel> SendCustomEmailAsync(string toEmail, string subject, string htmlBody, string? plainTextBody = null);
    }
}
