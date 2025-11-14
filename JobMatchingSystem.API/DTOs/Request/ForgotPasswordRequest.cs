using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class ForgotPasswordRequest
    {
        [Required, EmailAddress]
        public string Email { get; set; }
    }
}
