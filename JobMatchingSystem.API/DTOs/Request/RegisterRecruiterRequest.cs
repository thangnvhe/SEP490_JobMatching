using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class RegisterRecruiterRequest
    {
        [Required]
        public string FullName { get; set; }
        [Required, EmailAddress]
        public string WorkEmail { get; set; }
        [Required, Phone]
        public string PhoneNumber { get; set; }
        [Required]
        public string CompanyName { get; set; }
        [Required]
        public string CompanyLocation { get; set; }
        [Required, Url]
        public string WebsiteUrl { get; set; }
        [Required]
        public string TaxCode { get; set; }
        [Required]
        public string Address { get; set; }
        [Required, DataType(DataType.Upload)]
        public IFormFile LicenseFile { get; set; }
    }
}
