using Microsoft.AspNetCore.Identity;
using JobMatchingSystem.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.Domain.Entities
{
    public class ApplicationUser : IdentityUser<int>
    {
        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? Phone { get; set; }

        [MaxLength(255)]
        public string? AvatarUrl { get; set; }

        public Gender? Gender { get; set; }

        public DateTime? Birthday { get; set; }

        public int Score { get; set; } = 0;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual CandidateProfile? CandidateProfile { get; set; }
        public virtual ICollection<CompanyRecruiter> CompanyRecruiters { get; set; } = new List<CompanyRecruiter>();
        public virtual ICollection<Job> CreatedJobs { get; set; } = new List<Job>();
        public virtual ICollection<Job> StaffJobs { get; set; } = new List<Job>();
        public virtual ICollection<Company> VerifiedCompanies { get; set; } = new List<Company>();
        public virtual ICollection<ApplyJob> ApplyJobs { get; set; } = new List<ApplyJob>();
        public virtual ICollection<SavedJob> SavedJobs { get; set; } = new List<SavedJob>();
        public virtual ICollection<SavedCV> SavedCVs { get; set; } = new List<SavedCV>();
        public virtual ICollection<DataCV> DataCVs { get; set; } = new List<DataCV>();
        public virtual ICollection<Report> Reports { get; set; } = new List<Report>();
        public virtual ICollection<Report> ReviewedReports { get; set; } = new List<Report>();
        
    }
}