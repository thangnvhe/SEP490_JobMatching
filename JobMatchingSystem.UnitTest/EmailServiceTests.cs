using System.Threading.Tasks;
using JobMatchingSystem.Infrastructure.Configuration;
using JobMatchingSystem.Infrastructure.Services;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace JobMatchingSystem.UnitTest
{
    public class EmailServiceTests
    {
        private readonly EmailService _emailService;
        private readonly EmailSettings _emailSettings;

        public EmailServiceTests()
        {
            // Mock email settings for testing
            _emailSettings = new EmailSettings
            {
                SmtpServer = "smtp.test.com",
                SmtpPort = 587,
                SenderEmail = "test@jobmatching.com",
                SenderName = "JobMatching System",
                Username = "testuser",
                Password = "testpass",
                EnableSsl = true
            };

            var mockOptions = new Mock<IOptions<EmailSettings>>();
            mockOptions.Setup(x => x.Value).Returns(_emailSettings);
            _emailService = new EmailService(mockOptions.Object);
        }

        [Fact]
        public async Task SendWelcomeEmailAsync_ShouldReturnFailure_WithInvalidSmtpSettings()
        {
            // Arrange - Use invalid SMTP settings that will fail
            var invalidSettings = new EmailSettings
            {
                SmtpServer = "invalid.smtp.server",
                SmtpPort = 587,
                SenderEmail = "invalid@test.com",
                SenderName = "Test",
                Username = "invalid",
                Password = "invalid",
                EnableSsl = true
            };

            var mockOptions = new Mock<IOptions<EmailSettings>>();
            mockOptions.Setup(x => x.Value).Returns(invalidSettings);
            var invalidService = new EmailService(mockOptions.Object);

            // Act
            var result = await invalidService.SendWelcomeEmailAsync("nguyenvanthang08112003.com", "John Doe", "https://google.com");

            // Assert
            Assert.False(result.Success);
            Assert.Contains("Failed to send email", result.Message);
        }

        [Fact]
        public void GetWelcomeEmailTemplate_ShouldContainUserNameAndConfirmationLink()
        {
            // This test validates the template generation without actually sending email
            var userName = "Jane Smith";
            var confirmationLink = "https://example.com/confirm/abc123";
            
            // Use reflection to access private method for testing
            var method = typeof(EmailService).GetMethod("GetWelcomeEmailTemplate", 
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            
            var result = (string)method!.Invoke(_emailService, new object[] { userName, confirmationLink });

            // Assert
            Assert.Contains(userName, result);
            Assert.Contains(confirmationLink, result);
            Assert.Contains("Welcome to JobMatching System!", result);
            Assert.Contains("<!DOCTYPE html>", result); // Ensure it's HTML
        }

        [Fact]
        public void GetEmailConfirmationTemplate_ShouldContainRequiredElements()
        {
            var userName = "Bob Wilson";
            var confirmationLink = "https://example.com/confirm/xyz789";
            
            var method = typeof(EmailService).GetMethod("GetEmailConfirmationTemplate", 
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            
            var result = (string)method!.Invoke(_emailService, new object[] { userName, confirmationLink });

            Assert.Contains(userName, result);
            Assert.Contains(confirmationLink, result);
            Assert.Contains("Email Confirmation", result);
            Assert.Contains("expire in 24 hours", result);
        }

        [Fact]
        public void GetPasswordResetTemplate_ShouldContainSecurityWarning()
        {
            var userName = "Alice Johnson";
            var resetLink = "https://example.com/reset/token123";
            
            var method = typeof(EmailService).GetMethod("GetPasswordResetTemplate", 
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            
            var result = (string)method!.Invoke(_emailService, new object[] { userName, resetLink });

            Assert.Contains(userName, result);
            Assert.Contains(resetLink, result);
            Assert.Contains("Password Reset", result);
            Assert.Contains("Security Notice", result);
            Assert.Contains("expire in 1 hour", result);
        }

        [Fact]
        public void GetJobStatusUpdateTemplate_ShouldChangeColorBasedOnStatus()
        {
            var candidateName = "John Developer";
            var jobTitle = "Senior Software Engineer";
            var companyName = "Tech Corp";
            var message = "Great interview! Looking forward to next steps.";
            
            var method = typeof(EmailService).GetMethod("GetJobStatusUpdateTemplate", 
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            
            // Test accepted status (should be green)
            var acceptedResult = (string)method!.Invoke(_emailService, new object[] { candidateName, jobTitle, companyName, "accepted", message });
            Assert.Contains("#28a745", acceptedResult); // Green color
            Assert.Contains("🎉", acceptedResult); // Party emoji
            
            // Test rejected status (should be red)
            var rejectedResult = (string)method.Invoke(_emailService, new object[] { candidateName, jobTitle, companyName, "rejected", message });
            Assert.Contains("#dc3545", rejectedResult); // Red color
            Assert.Contains("😔", rejectedResult); // Sad emoji
            
            // Test interview status (should be yellow)
            var interviewResult = (string)method.Invoke(_emailService, new object[] { candidateName, jobTitle, companyName, "interview", message });
            Assert.Contains("#ffc107", interviewResult); // Yellow color
            Assert.Contains("📞", interviewResult); // Phone emoji
        }

        [Fact]
        public void GetJobStatusUpdateTemplate_ShouldHandleNullMessage()
        {
            var candidateName = "Jane Developer";
            var jobTitle = "Frontend Developer";
            var companyName = "Design Studio";
            
            var method = typeof(EmailService).GetMethod("GetJobStatusUpdateTemplate", 
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            
            var result = (string)method!.Invoke(_emailService, new object[] { candidateName, jobTitle, companyName, "pending", null });
            
            Assert.Contains(candidateName, result);
            Assert.Contains(jobTitle, result);
            Assert.Contains(companyName, result);
            // Should not contain message section when null
            Assert.DoesNotContain("Message from", result);
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        [InlineData(null)]
        public async Task EmailMethods_ShouldHandleInvalidEmailAddresses_Gracefully(string invalidEmail)
        {
            // These will fail due to invalid SMTP settings, but should handle invalid emails gracefully
            var welcomeResult = await _emailService.SendWelcomeEmailAsync(invalidEmail, "Test User", "https://link.com");
            var confirmResult = await _emailService.SendEmailConfirmationAsync(invalidEmail, "Test User", "https://link.com");
            var resetResult = await _emailService.SendPasswordResetEmailAsync(invalidEmail, "Test User", "https://link.com");
            var jobResult = await _emailService.SendJobStatusUpdateEmailAsync(invalidEmail, "Test User", "Job Title", "Company", "accepted");

            // All should fail gracefully (due to SMTP settings), not throw exceptions
            Assert.False(welcomeResult.Success);
            Assert.False(confirmResult.Success);
            Assert.False(resetResult.Success);
            Assert.False(jobResult.Success);
        }

        [Fact]
        public async Task SendWelcomeEmailAsync_ShouldSucceed_WithRealEmailAddresses()
        {
            // Arrange - Use real Gmail SMTP settings (will only work with valid credentials)
            var realEmailSettings = new EmailSettings
            {
                SmtpServer = "smtp.gmail.com",
                SmtpPort = 587,
                SenderEmail = "thangnvhe171327@fpt.edu.vn",
                SenderName = "JobMatching System - Test",
                Username = "thangnvhe171327@fpt.edu.vn",
                Password = "xpwg meqe rekw ogpn", // Real app password
                EnableSsl = true
            };

            var mockOptions = new Mock<IOptions<EmailSettings>>();
            mockOptions.Setup(x => x.Value).Returns(realEmailSettings);
            var realEmailService = new EmailService(mockOptions.Object);

            // Act
            var result = await realEmailService.SendWelcomeEmailAsync(
                "nguyenvanthang08112003@gmail.com",
                "Thang Nguyen", 
                "https://jobmatching.example.com/confirm?token=test123");

            // Assert
            // Note: This should succeed with proper Gmail app password configured
            Assert.True(result.Success);
            Assert.Contains("Email sent successfully", result.Message);
            
            // To make this test pass, you need to:
            // 1. Replace "your-app-password-here" with actual Gmail app password
            // 2. Enable 2-factor authentication on thangnvhe171327@fpt.edu.vn
            // 3. Generate app password for "Mail" application
            // 4. Then change Assert.False to Assert.True above
        }

        [Fact]
        public async Task SendJobStatusUpdateEmailAsync_ShouldSucceed_WithRealEmailAddresses()
        {
            // Arrange - Test job status update email
            var realEmailSettings = new EmailSettings
            {
                SmtpServer = "smtp.gmail.com",
                SmtpPort = 587,
                SenderEmail = "thangnvhe171327@fpt.edu.vn",
                SenderName = "JobMatching System - Test",
                Username = "thangnvhe171327@fpt.edu.vn",
                Password = "xpwg meqe rekw ogpn", // Note: This needs to be replaced with actual app password
                EnableSsl = true
            };

            var mockOptions = new Mock<IOptions<EmailSettings>>();
            mockOptions.Setup(x => x.Value).Returns(realEmailSettings);
            var realEmailService = new EmailService(mockOptions.Object);

            // Act
            var result = await realEmailService.SendJobStatusUpdateEmailAsync(
                "nguyenvanthang08112003@gmail.com",
                "Thang Nguyen",
                "Senior .NET Developer",
                "FPT Software",
                "interview",
                "Congratulations! We were impressed with your application. Please schedule an interview with our HR team.");

            // Assert
            // Note: This should succeed with proper Gmail app password configured
            Assert.True(result.Success);
            Assert.Contains("Email sent successfully", result.Message);
        }

        [Fact]
        public async Task SendPasswordResetEmailAsync_ShouldSucceed_WithRealEmailAddresses()
        {
            // Arrange - Test password reset email
            var realEmailSettings = new EmailSettings
            {
                SmtpServer = "smtp.gmail.com",
                SmtpPort = 587,
                SenderEmail = "thangnvhe171327@fpt.edu.vn",
                SenderName = "JobMatching System - Test",
                Username = "thangnvhe171327@fpt.edu.vn",
                Password = "xpwg meqe rekw ogpn", // Note: This needs to be replaced with actual app password
                EnableSsl = true
            };

            var mockOptions = new Mock<IOptions<EmailSettings>>();
            mockOptions.Setup(x => x.Value).Returns(realEmailSettings);
            var realEmailService = new EmailService(mockOptions.Object);

            // Act
            var result = await realEmailService.SendPasswordResetEmailAsync(
                "nguyenvanthang08112003@gmail.com",
                "Thang Nguyen",
                "https://jobmatching.example.com/reset?token=reset456&email=nguyenvanthang08112003@gmail.com");

            // Assert
            // Note: This should succeed with proper Gmail app password configured
            Assert.True(result.Success);
            Assert.Contains("Email sent successfully", result.Message);
        }
    }
}
