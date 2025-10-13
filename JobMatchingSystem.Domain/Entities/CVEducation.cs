using JobMatchingSystem.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMatchingSystem.Domain.Entities
{
    public class CVEducation
    {
        [Key]
        public int Id { get; set; }

        public int? CVId { get; set; }
        public int? UserId { get; set; }

        [MaxLength(150)]
        public string? SchoolName { get; set; }

        [MaxLength(100)]
        public DegreeType? Degree { get; set; }

        [MaxLength(100)]
        public string? Major { get; set; }

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