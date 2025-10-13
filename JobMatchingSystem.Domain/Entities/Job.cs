using JobMatchingSystem.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMatchingSystem.Domain.Entities
{
    public class Job
    {
        [Key]
        public int JobId { get; set; }

        [Required]
        [MaxLength(150)]
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; }

        public string Requirements { get; set; }

        public string? Benefits { get; set; }

        public int? SalaryMin { get; set; }

        public int? SalaryMax { get; set; }

        [MaxLength(100)]
        public string Location { get; set; }

        public JobType? JobType { get; set; }

        public JobStatus? Status { get; set; }

        public int ViewsCount { get; set; } = 0;

        public int AppliesCount { get; set; } = 0;

        public int CompanyId { get; set; }

        public int? Poster { get; set; }

        public int? VerifiedBy { get; set; }

        public DateTime? CreatedAt { get; set; }

        public DateTime? OpenedAt { get; set; }

        public DateTime? ExpiredAt { get; set; }

        // Navigation properties
        [ForeignKey("CompanyId")]
        public virtual Company Company { get; set; } = null!;

        [ForeignKey("Poster")]
        public virtual ApplicationUser? Recruiter { get; set; }

        [ForeignKey("VerifiedBy")]
        public virtual ApplicationUser? Staff { get; set; }

        public virtual ICollection<ApplyJob> ApplyJobs { get; set; } = new List<ApplyJob>();
        public virtual ICollection<SavedJob> SavedJobs { get; set; } = new List<SavedJob>();
        public virtual ICollection<Report> Reports { get; set; } = new List<Report>();
        public virtual ICollection<EntityTaxonomy> EntityTaxonomies { get; set; } = new List<EntityTaxonomy>();
        public virtual ICollection<Interview> Interviews { get; set; } = new List<Interview>();
        public virtual ICollection<Offer> Offers { get; set; } = new List<Offer>();
    }
}