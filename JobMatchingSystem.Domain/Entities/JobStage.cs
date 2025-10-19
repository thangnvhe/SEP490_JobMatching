using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JobMatchingSystem.Domain.Entities
{
    public class JobStage
    {
        [Key]
        public int Id { get; set; }
        public int JobId { get; set; }
        public int StageNumber { get; set; }
        public bool Type { get; set; } = false;
        // Navigation properties
        [ForeignKey("JobId")]
        public virtual Job? Job { get; set; } = null;
        public virtual ICollection<CandidateStage>? CandidateStages { get; set; } = new List<CandidateStage>();
    }
}
