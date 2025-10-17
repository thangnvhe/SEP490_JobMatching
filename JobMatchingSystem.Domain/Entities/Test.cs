using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JobMatchingSystem.Domain.Entities
{
    public class Test
    {
        [Key]
        public int TestId { get; set; }
        public int JobId { get; set; }
        public int CandidateId { get; set; }
        public int RoundId { get; set; }
        public string? Description { get; set; }
        public int TotalScore { get; set; }
        public int CreateBy { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime? CreateAt { get; set; }
        // Navigation properties
        public virtual Job? Job { get; set; }
        public virtual ApplicationUser? Candidate { get; set; }
        public virtual Round? Round { get; set; }
        public virtual ICollection<TestQuestion> TestQuestions { get; set; } = new List<TestQuestion>();
    }
}
