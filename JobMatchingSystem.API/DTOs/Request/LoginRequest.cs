using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class LoginRequest
    {
        [Required]
        public string Email { get; set; }
        [Required]
        public string PassWord { get; set; }
    }
}
