using JobMatchingSystem.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMatchingSystem.Domain.Entities
{
    public class ApplyJob
    {
        [Key]
        public int ApplyId { get; set; }

        public int UserId { get; set; }

        public int JobId { get; set; }

        public ApplicationStatus Status { get; set; }

        public DateTime AppliedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual ApplicationUser User { get; set; } = null!;

        [ForeignKey("JobId")]
        public virtual Job Job { get; set; } = null!;
    }
}