using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JobMatchingSystem.Domain.Entities
{
    public class Interview
    {
        [Key]
        public int InterviewId { get; set; }
        public int JobId { get; set; }
        public int CandidateId { get; set; }
        public int RoundId { get; set; }
        public string? Title { get; set; }
        public string? Notes { get; set; }
        public DateTime? ScheduledAt { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? InterviewName { get; set; }
        public string? Location { get; set; }
        public string? MeetingId { get; set; }
        public string? Result { get; set; }
        public bool? IsActive { get; set; }
        // Navigation properties
        [ForeignKey("RoundId")]
        public virtual Round? Round { get; set; }
        [ForeignKey("JobId")]
        public virtual Job? Job { get; set; }
        [ForeignKey("CandidateId")]
        public virtual ApplicationUser? Candidate { get; set; }
    }
}
