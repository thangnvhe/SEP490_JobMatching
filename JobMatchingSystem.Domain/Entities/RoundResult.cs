using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JobMatchingSystem.Domain.Entities
{
    public class RoundResult
    {
        [Key]
        public int RoundResultId { get; set; }
        public int RoundId { get; set; }
        public int CandidateId { get; set; }
        public bool IsPassed { get; set; } = false;
        public int? FinalScore { get; set; }
        public string? Note { get; set; }
        // Navigation properties
        [ForeignKey("RoundId")]
        public virtual Round? Round { get; set; }
        [ForeignKey("CandidateId")]
        public virtual ApplicationUser? Candidate { get; set; }
    }
}
