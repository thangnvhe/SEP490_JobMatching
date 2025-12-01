using JobMatchingSystem.API.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMatchingSystem.API.Models
{
    public class Job
    {
        [Key]
        public int JobId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Requirements { get; set; }
        public string Benefits { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public int? SalaryMin { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public int? SalaryMax { get; set; }
        public string Location { get; set; }
        public int? ExperienceYear { get; set; }
        public string JobType { get; set; }
        public JobStatus Status { get; set; } = JobStatus.Draft;
        public int? PositionId { get; set; }
        public int ViewsCount { get; set; } = 0;
        public int CompanyId { get; set; }
        public int RecuiterId { get; set; }
        public int? VerifiedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? OpenedAt { get; set; }
        public DateTime? ExpiredAt { get; set; }

        public bool IsHighlighted { get; set; } = false;
        // Thời điểm Job nổi bật sẽ kết thúc
        public DateTime? HighlightedUntil { get; set; }

        public bool IsDeleted { get; set; } = false;

        // Navigation properties
        [ForeignKey("CompanyId")]
        public virtual Company? Company { get; set; } = null!;
        [ForeignKey("RecuiterId")]
        public virtual ApplicationUser? Recruiter { get; set; }
        [ForeignKey("VerifiedBy")]
        public virtual ApplicationUser? Admin { get; set; }
        public virtual ICollection<CandidateJob> CandidateJobs { get; set; } = new List<CandidateJob>();
        public virtual ICollection<SavedJob> SavedJobs { get; set; } = new List<SavedJob>();
        public virtual ICollection<Report> Reports { get; set; } = new List<Report>();
        public virtual ICollection<JobStage> JobStages { get; set; } = new List<JobStage>();
        public virtual ICollection<JobTaxonomy> JobTaxonomies { get; set; } = new List<JobTaxonomy>();

        [ForeignKey("PositionId")]
        public virtual Position? Position { get; set; }
    }
}