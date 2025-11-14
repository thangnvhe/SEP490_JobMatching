namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string body);
        Task SendResetPasswordEmailAsync(string toEmail, string token);
        Task SendEmailConfirmationAsync(string toEmail, string fullName, string tokenLink);
        Task SendWelcomeEmailAsync(string toEmail, string fullName);
    }
}
