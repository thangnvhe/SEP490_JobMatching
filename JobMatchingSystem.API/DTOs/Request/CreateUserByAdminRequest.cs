using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class CreateUserByAdminRequest
    {
        [Required(ErrorMessage = "Full name is required.")]
        [StringLength(100, ErrorMessage = "Full name must be less than 100 characters.")]
        public string FullName { get; set; }

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string Email { get; set; }

        [Phone(ErrorMessage = "Invalid phone number.")]
        public string? PhoneNumber { get; set; }

        [Required(ErrorMessage = "Role is required.")]
        [RegularExpression("^(Admin|Staff|Recruiter|Candidate)$",
        ErrorMessage = "Role must be one of: Admin, Staff, Recruiter, Candidate.")]
        public string Role { get; set; }
    }
}
