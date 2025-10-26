namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string body);
        Task SendResetPasswordEmailAsync(string toEmail, string resetLink);
    }
}
