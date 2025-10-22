using JobMatchingSystem.API.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMatchingSystem.API.Entities
{
    public class CVEducation
    {
        [Key]
        public int Id { get; set; }

        public int? CVId { get; set; }
        public int? UserId { get; set; }
        public string SchoolName { get; set; }
        public DegreeType? Degree { get; set; }
        public string Major { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public string? Description { get; set; }

        // Navigation properties
        [ForeignKey("CVId")]
        public virtual DataCV DataCV { get; set; } = null!;
        [ForeignKey("UserId")]
        public virtual ApplicationUser User { get; set; } = null!;
    }
}