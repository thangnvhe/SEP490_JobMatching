using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMatchingSystem.Domain.Entities
{
    public class CVAchievement
    {
        [Key]
        public int Id { get; set; }

        public int? CVId { get; set; }
        public int? UserId { get; set; }

        [MaxLength(150)]
        public string? Title { get; set; }
        public string? Organization { get; set; }

        public string? Description { get; set; }

        public DateTime? AchievedAt { get; set; }

        // Navigation properties
        [ForeignKey("CVId")]
        public virtual DataCV DataCV { get; set; } = null!;
        [ForeignKey("UserId")]
        public virtual ApplicationUser User { get; set; } = null!;
    }
}