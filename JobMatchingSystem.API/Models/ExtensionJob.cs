using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMatchingSystem.API.Models
{
    public class ExtensionJob
    {
        [Key]
        public int Id { get; set; }
        public int RecuiterId { get; set; }
        public int? ExtensionJobDays { get; set; }
        public int? ExtensionJobDaysCount { get; set; }

        [ForeignKey("RecuiterId")]
        public virtual ApplicationUser? Recruiter { get; set; }
    }
}
