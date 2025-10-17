using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JobMatchingSystem.Domain.Entities
{
    public class Round
    {
        [Key]
        public int RoundId { get; set; }
        public int JobId { get; set; }
        public int RoundNumber { get; set; }
        public bool Type { get; set; } = false;
        // Navigation properties
        public virtual ICollection<Interview> Interviews { get; set; } = new List<Interview>();
        public virtual ICollection<Test> Tests { get; set; } = new List<Test>();
        [ForeignKey("JobId")]
        public virtual Job Job { get; set; } = null;
        public virtual ICollection<RoundResult> RoundResults { get; set; } = new List<RoundResult>();
    }
}
