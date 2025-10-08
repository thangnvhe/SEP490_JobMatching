using JobMatchingSystem.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMatchingSystem.Domain.Entities
{
    public class Company
    {
        [Key]
        public int CompanyId { get; set; }

        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        [MaxLength(255)]
        public string? Logo { get; set; }

        [MaxLength(100)]
        public string? Email { get; set; }

        [MaxLength(150)]
        public string? Website { get; set; }

        [MaxLength(255)]
        public string? Address { get; set; }

        [MaxLength(20)]
        public string? PhoneContact { get; set; }

        [MaxLength(50)]
        public string? TaxCode { get; set; }

        [MaxLength(255)]
        public string? LicenseFile { get; set; }

        public CompanyStatus Status { get; set; } = CompanyStatus.Pending;

        public string? RejectReason { get; set; }

        public int Point { get; set; } = 0;

        public int? VerifiedBy { get; set; }

        public DateTime? VerifiedAt { get; set; }

        public DateTime? CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public bool IsActive { get; set; } = true;

        // Navigation properties
        [ForeignKey("VerifiedBy")]
        public virtual ApplicationUser? VerifiedByUser { get; set; }
        public virtual ICollection<CompanyRecruiter> CompanyRecruiters { get; set; } = new List<CompanyRecruiter>();
        public virtual ICollection<Job> Jobs { get; set; } = new List<Job>();
    }
}