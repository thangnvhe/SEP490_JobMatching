using JobMatchingSystem.API.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMatchingSystem.API.Models
{
    public class Company
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; }
        public string Logo { get; set; }
        public string Email { get; set; }
        public string? Website { get; set; }
        public string Address { get; set; }
        public string PhoneContact { get; set; }
        public string TaxCode { get; set; }
        public string LicenseFile { get; set; }

        public CompanyStatus Status { get; set; } = CompanyStatus.Pending;

        public string? RejectReason { get; set; }

        public int Score { get; set; } = 100;

        public int? VerifiedBy { get; set; }

        public DateTime? VerifiedAt { get; set; }

        public DateTime? CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public bool IsActive { get; set; } = false;

        // Navigation properties
        [ForeignKey("VerifiedBy")]
        public virtual ApplicationUser? VerifiedByUser { get; set; }
        public virtual ICollection<ApplicationUser> ApplicationUsers { get; set; } = new List<ApplicationUser>();
        public virtual ICollection<Job> Jobs { get; set; } = new List<Job>();
    }
}