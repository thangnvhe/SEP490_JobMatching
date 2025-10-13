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
        public string? Title { get; set; }
        public string? Notes { get; set; }
        public DateTime? ScheduledAt { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        [MaxLength(100)]
        public string? InterviewName { get; set; }
        [MaxLength(255)]
        public string? Location { get; set; }
        [MaxLength(100)]
        public string? MeetingId { get; set; }
        public int? Round { get; set; }
        [MaxLength(200)]
        public string? Result { get; set; }
        public bool? IsActive { get; set; }
        // Navigation properties
        [ForeignKey("JobId")]
        public virtual Job? Job { get; set; }
        [ForeignKey("CandidateId")]
        public virtual ApplicationUser? Candidate { get; set; }
    }
}
