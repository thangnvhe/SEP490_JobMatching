using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMatchingSystem.Domain.Entities
{
    public class SavedJob
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; }

        public int JobId { get; set; }

        public DateTime? SavedAt { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual ApplicationUser User { get; set; } = null!;

        [ForeignKey("JobId")]
        public virtual Job Job { get; set; } = null!;
    }
}