using Microsoft.AspNetCore.Http;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class UpdateUserProfileRequest
    {
        public string? FullName { get; set; }
        public bool? Gender { get; set; }
        public DateTime? Birthday { get; set; }
        public IFormFile? Avatar { get; set; }
        public string? PhoneNumber { get; set; }
    }
}
