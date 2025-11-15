using JobMatchingSystem.API.Enums;

namespace JobMatchingSystem.API.DTOs.Response
{
    public class CompanyDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public string? Logo { get; set; }
        public string Email { get; set; }
        public string? Website { get; set; }
        public string Address { get; set; }
        public string PhoneContact { get; set; }
        public CompanyStatus Status { get; set; }
        public string TaxCode { get; set; }
        public string LicenseFile { get; set; }
    }
}
