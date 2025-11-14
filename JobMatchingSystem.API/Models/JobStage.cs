using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JobMatchingSystem.API.Models
{
    public class JobStage
    {
        [Key]
        public int Id { get; set; }
        public int JobId { get; set; }
        public int StageNumber { get; set; }
        public string Name { get; set; }
        public int? HiringManagerId { get; set; }
        // Navigation properties
        [ForeignKey("JobId")]
        public virtual Job? Job { get; set; } = null;
        [ForeignKey("HiringManagerId")]
        public virtual ApplicationUser? HiringManager { get; set; } = null;
        public virtual ICollection<CandidateStage>? CandidateStages { get; set; }
    }
}
