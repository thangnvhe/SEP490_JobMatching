using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class CreateCompanyRequest
    {
        [Required(ErrorMessage = "Full name is required")]
        [StringLength(100, ErrorMessage = "Full name must not exceed 100 characters")]
        public string FullName { get; set; }

        [Required(ErrorMessage = "Work email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Phone number is required")]
        [Phone(ErrorMessage = "Invalid phone number format")]
        [StringLength(15, MinimumLength = 8, ErrorMessage = "Phone number must be between 8–15 digits")]
        public string PhoneContact { get; set; }

        [Required(ErrorMessage = "Company name is required")]
        [StringLength(150, ErrorMessage = "Company name must not exceed 150 characters")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Website URL is required")]
        [Url(ErrorMessage = "Invalid website URL format")]
        public string? Website { get; set; }

        [Required(ErrorMessage = "Tax code is required")]
        public string TaxCode { get; set; }

        [Required(ErrorMessage = "Address is required")]
        [StringLength(255, ErrorMessage = "Address must not exceed 255 characters")]
        public string Address { get; set; }
        [Required(ErrorMessage = "Address is required")]
        [StringLength(255, ErrorMessage = "Address must not exceed 255 characters")]
        public string Description { get; set; }
        [Required(ErrorMessage = "License file is required")]
        [DataType(DataType.Upload)]
        public IFormFile LicenseFile { get; set; }
    }
}
