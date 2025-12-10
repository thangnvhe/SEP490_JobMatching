namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string body);
        Task SendResetPasswordEmailAsync(string toEmail, string token);
        Task SendEmailConfirmationAsync(string toEmail, string fullName, string tokenLink);
        Task SendWelcomeEmailAsync(string toEmail, string fullName);
        Task SendCompanyApprovedEmailAsync(string toEmail, string fullName, string token, string companyName);
        Task SendCompanyRejectedEmailAsync(string toEmail, string fullName, string companyName, string rejectReason);
        Task SendHmPasswordEmailAsync(string toEmail, string fullName, string password);
        Task SendJobClosedNotificationAsync(string toEmail, string candidateName, string jobTitle, string companyName);
        Task SendCompanyClosedNotificationAsync(string toEmail, string candidateName, string jobTitle, string companyName);
        Task SendJobDeletedNotificationAsync(string toEmail, string fullName, string jobTitle, string companyName);
        Task SendAccountSuspensionNotificationAsync(string toEmail, string fullName, string reason, bool isCompany);
        Task SendFalseReportNotificationAsync(string toEmail, string fullName, string jobTitle, string companyName);
        Task SendJobClosedDueToReportAsync(string toEmail, string fullName, string jobTitle, string companyName, string reason);
        Task SendInterviewScheduleNotificationAsync(string toEmail, string candidateName, string jobTitle, string companyName, DateTime interviewDate, TimeOnly? startTime, TimeOnly? endTime, string? location, string? googleMeetLink, string confirmationToken);
    }
}
