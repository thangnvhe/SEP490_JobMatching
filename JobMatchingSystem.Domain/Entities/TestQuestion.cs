using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JobMatchingSystem.Domain.Entities
{
    public class TestQuestion
    {
        [Key]
        public int QuestionId { get; set; }
        public int TestId { get; set; }
        public string Content { get; set; }
        public int Points { get; set; }
        // Navigation properties
        public virtual Test? Test { get; set; }
        public virtual ICollection<QuestionOption> QuestionOptions { get; set; } = new List<QuestionOption>();
    }
}
