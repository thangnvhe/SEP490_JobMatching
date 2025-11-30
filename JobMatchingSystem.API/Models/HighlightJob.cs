using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMatchingSystem.API.Models
{
    public class HighlightJob
    {
        [Key]
        public int Id { get; set; }
        public int RecuiterId { get; set; }
        public int? HighlightJobDays { get; set; }
        public int? HighlightJobDaysCount { get; set; }

        [ForeignKey("RecuiterId")]
        public virtual ApplicationUser? Recruiter { get; set; }
    }
}
