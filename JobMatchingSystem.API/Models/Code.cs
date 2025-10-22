using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JobMatchingSystem.API.Entities
{
    public class Code
    {
        [Key]
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Image { get; set; }
        // Navigation properties
        public virtual ICollection<CodeTestCase>? CodeTestCases { get; set; } = new List<CodeTestCase>();
        public virtual CandidateStage? CandidateStage { get; set; }
    }
}
