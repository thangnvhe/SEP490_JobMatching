using JobMatchingSystem.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMatchingSystem.Domain.Entities
{
    public class CandidateJob
    {
        [Key]
        public int CandidateJobId { get; set; }

        public int UserId { get; set; }

        public int JobId { get; set; }

        public CandidateJobStatus Status { get; set; }

        public DateTime AppliedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual ApplicationUser User { get; set; } = null!;

        [ForeignKey("JobId")]
        public virtual Job Job { get; set; } = null!;
        public virtual ICollection<CandidateStage> CandidateStages { get; set; } = new List<CandidateStage>();
        // Offer associated with this candidate job
        public virtual Offer? Offer { get; set; } = null;
    }
}