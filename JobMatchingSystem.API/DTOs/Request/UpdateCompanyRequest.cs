using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class UpdateCompanyRequest
    {
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

        [Required(ErrorMessage = "Address is required")]
        [StringLength(255, ErrorMessage = "Address must not exceed 255 characters")]
        public string Address { get; set; }
        [Required(ErrorMessage = "Address is required")]
        [StringLength(255, ErrorMessage = "Address must not exceed 255 characters")]
        public string Description { get; set; }
        [Required(ErrorMessage = "License file is required")]
        [DataType(DataType.Upload)]
        public IFormFile? Logo { get; set; }
    }
}
