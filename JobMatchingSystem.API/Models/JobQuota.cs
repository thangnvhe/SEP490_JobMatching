using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMatchingSystem.API.Models
{
    public class JobQuota
    {
        [Key]
        public int Id { get; set; }
        public int RecruiterId { get; set; }
        public int MonthlyQuota { get; set; }
        public int ExtraQuota { get; set; }

        [ForeignKey("RecruiterId")]
        public virtual ApplicationUser Recruiter { get; set; } = null!;
    }
}
