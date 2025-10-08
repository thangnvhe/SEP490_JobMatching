using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMatchingSystem.Domain.Entities
{
    public class CVExperience
    {
        [Key]
        public int Id { get; set; }

        public int? CVId { get; set; }
        public int? userId { get; set; }

        [MaxLength(150)]
        public string? Company { get; set; }

        [MaxLength(150)]
        public string? Position { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public string? Description { get; set; }

        // Navigation properties
        [ForeignKey("CVId")]
        public virtual DataCV DataCV { get; set; } = null!;
        [ForeignKey("userId")]
        public virtual ApplicationUser User { get; set; } = null!;
    }
}