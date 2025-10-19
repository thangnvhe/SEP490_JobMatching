using Microsoft.AspNetCore.Identity;
using JobMatchingSystem.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMatchingSystem.Domain.Entities
{
    public class ApplicationUser : IdentityUser<int>
    {
        public string FullName { get; set; } = string.Empty;

        public string? AvatarUrl { get; set; }

        public bool? Gender { get; set; }

        public DateTime? Birthday { get; set; }

        public int? Score { get; set; } = 100;

        public bool? IsActive { get; set; } = true;

        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual CandidateProfile? CandidateProfile { get; set; }
        public virtual CompanyRecruiter? CompanyRecruiter { get; set; } 
        public virtual ICollection<Job> CreatedJobs { get; set; } = new List<Job>();
        public virtual ICollection<Job> StaffJobs { get; set; } = new List<Job>();
        public virtual ICollection<Company> VerifiedCompanies { get; set; } = new List<Company>();
        public virtual ICollection<CandidateJob> ApplyJobs { get; set; } = new List<CandidateJob>();
        public virtual ICollection<SavedJob> SavedJobs { get; set; } = new List<SavedJob>();
        public virtual ICollection<SavedCV> SavedCVs { get; set; } = new List<SavedCV>();
        public virtual ICollection<DataCV> DataCVs { get; set; } = new List<DataCV>();
        public virtual ICollection<Report> Reports { get; set; } = new List<Report>();
        public virtual ICollection<ReportSolved> ReviewedReports { get; set; } = new List<ReportSolved>();
        public virtual ICollection<Offer> Offers { get; set; } = new List<Offer>();
        public virtual ICollection<CVSkill> CVSkills { get; set; } = new List<CVSkill>();
        public virtual ICollection<CVProject> CVProjects { get; set; } = new List<CVProject>();
        public virtual ICollection<CVEducation> CVEducations { get; set; } = new List<CVEducation>();
        public virtual ICollection<CVCertificate> CVCertificates { get; set; } = new List<CVCertificate>();
        public virtual ICollection<CVAchievement> CVAchievements { get; set; } = new List<CVAchievement>();
        public virtual ICollection<CVExperience> CVExperiences { get; set; } = new List<CVExperience>();

    }
}