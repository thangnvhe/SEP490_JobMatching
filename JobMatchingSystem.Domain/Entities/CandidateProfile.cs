using JobMatchingSystem.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMatchingSystem.Domain.Entities
{
    public class CandidateProfile
    {
        [Key]
        public int ProfileId { get; set; }

        public int UserId { get; set; }

        public int? ExperienceYears { get; set; }

        public int? SalaryExpect { get; set; }

        [MaxLength(100)]
        public string? Location { get; set; }

        public JobType? JobType { get; set; }

        public DateTime? CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual ApplicationUser User { get; set; } = null!;
        public virtual ICollection<SavedCV> SavedCVs { get; set; } = new List<SavedCV>();
        public virtual ICollection<EntityTaxonomy> EntityTaxonomies { get; set; } = new List<EntityTaxonomy>();
    }
}