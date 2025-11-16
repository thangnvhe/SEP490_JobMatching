using JobMatchingSystem.API.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMatchingSystem.API.Models
{
    public class CandidateJob
    {
        [Key]
        public int Id { get; set; }
        public int JobId { get; set; }
        public int? CVId { get; set; }
        public CandidateJobStatus Status { get; set; } = CandidateJobStatus.Pending;
        public DateTime AppliedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("JobId")]
        public virtual Job? Job { get; set; } = null!;
        public virtual ICollection<CandidateStage> CandidateStages { get; set; } = new List<CandidateStage>();
        [ForeignKey("CVId")]
        public virtual CVUpload? CandidateCV { get; set; } = null!;
    }
}