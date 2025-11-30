using Microsoft.AspNetCore.Identity;
using JobMatchingSystem.API.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMatchingSystem.API.Models
{
    public class ApplicationUser : IdentityUser<int>
    {
        public string FullName { get; set; } = string.Empty;

        public string? AvatarUrl { get; set; }

        public bool Gender { get; set; }

        public DateTime Birthday { get; set; }

        public int? Score { get; set; } = 100;

        public bool IsActive { get; set; } = true;

        public int? CompanyId { get; set; }

        public string Address { get; set; }  = string.Empty;

        public string? RefreshToken { get; set; }

        public DateTime? RefreshTokenExpiryTime { get; set; }

        public int? SaveCVCount { get; set; } = 100;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;


        // Navigation properties
        [ForeignKey("CompanyId")]
        public virtual Company? CompanyRecruiter { get; set; }
        public virtual ICollection<Job> CreatedJobs { get; set; } = new List<Job>();
        public virtual ICollection<Job> AdminJobs { get; set; } = new List<Job>();
        public virtual ICollection<Company> VerifiedCompanies { get; set; } = new List<Company>();
        public virtual ICollection<SavedJob> SavedJobs { get; set; } = new List<SavedJob>();
        public virtual ICollection<SavedCV> SavedCVs { get; set; } = new List<SavedCV>();
        public virtual ICollection<CVUpload> DataCVs { get; set; } = new List<CVUpload>();
        public virtual ICollection<Report> CreateReports { get; set; } = new List<Report>();
        public virtual ICollection<Report> VerifiedReports { get; set; } = new List<Report>();
        public virtual ICollection<CVProject> CVProjects { get; set; } = new List<CVProject>();
        public virtual ICollection<CVEducation> CVEducations { get; set; } = new List<CVEducation>();
        public virtual CVProfile? CVProfile { get; set; }
        public virtual ICollection<CVCertificate> CVCertificates { get; set; } = new List<CVCertificate>();
        public virtual ICollection<CVAchievement> CVAchievements { get; set; } = new List<CVAchievement>();
        public virtual ICollection<CVExperience> CVExperiences { get; set; } = new List<CVExperience>();
        public virtual ICollection<CandidateTaxonomy> CandidateTaxonomies { get; set; } = new List<CandidateTaxonomy>();
        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
        public virtual JobQuota? JobQuota { get; set; }

        public virtual ICollection<HighlightJob> HighlightJobs { get; set; } = new List<HighlightJob>();
        public virtual ICollection<ExtensionJob> ExtensionJobs { get; set; } = new List<ExtensionJob>();
    }
}