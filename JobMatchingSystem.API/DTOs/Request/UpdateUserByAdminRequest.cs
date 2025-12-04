using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class UpdateUserByAdminRequest
    {
        [StringLength(100, ErrorMessage = "Full name cannot exceed 100 characters")]
        public string? fullName { get; set; }

        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string? email { get; set; }

        [StringLength(15, ErrorMessage = "Phone number cannot exceed 15 characters")]
        [RegularExpression(@"^[0-9\-\+\(\)\s]+$", ErrorMessage = "Invalid phone number format")]
        public string? phoneNumber { get; set; }    
        [StringLength(500, ErrorMessage = "Address cannot exceed 500 characters")]
        public string? address { get; set; }

        public DateTime? birthday { get; set; }

        [StringLength(10, ErrorMessage = "Gender must be 'Male', 'Female', or 'Other'")]
        public string? gender { get; set; }

        public IFormFile? avatarFile { get; set; }

        public bool? isActive { get; set; }
        [StringLength(50, ErrorMessage = "Role name cannot exceed 50 characters")]
        public string? role { get; set; }

        // For recruiters - company assignment
        public int? companyId { get; set; }
    }
}