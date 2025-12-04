using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class UpdateUserByAdminRequest
    {
        [StringLength(100, ErrorMessage = "Full name cannot exceed 100 characters")]
        public string? FullName { get; set; }

        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string? Email { get; set; }

        [StringLength(15, ErrorMessage = "Phone number cannot exceed 15 characters")]
        [RegularExpression(@"^[0-9\-\+\(\)\s]+$", ErrorMessage = "Invalid phone number format")]
        public string? PhoneNumber { get; set; }

        [StringLength(500, ErrorMessage = "Address cannot exceed 500 characters")]
        public string? Address { get; set; }

        public DateTime? Birthday { get; set; }

        [StringLength(10, ErrorMessage = "Gender must be 'Male', 'Female', or 'Other'")]
        public string? Gender { get; set; }

        public IFormFile? AvatarFile { get; set; }

        public bool? IsActive { get; set; }

        [StringLength(50, ErrorMessage = "Role name cannot exceed 50 characters")]
        public string? Role { get; set; }

        // For recruiters - company assignment
        public int? CompanyId { get; set; }
    }
}