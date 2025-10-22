using JobMatchingSystem.API.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMatchingSystem.API.Entities
{
    public class CandidateProfile
    {
        [Key]
        public int ProfileId { get; set; }

        public int UserId { get; set; }

        public int ExperienceYears { get; set; }
        [Column(TypeName = "decimal(18,2)")]

        public decimal SalaryExpect { get; set; }

        public string? Location { get; set; }

        public JobType JobType { get; set; }

        public DateTime? CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual ApplicationUser User { get; set; } = null!;
        public virtual ICollection<EntityTaxonomy> EntityTaxonomies { get; set; } = new List<EntityTaxonomy>();
    }
}