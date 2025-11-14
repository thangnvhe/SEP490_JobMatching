using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMatchingSystem.API.Models
{
    public class SavedCV
    {
        [Key]
        public int Id { get; set; }
        public int RecruiterId { get; set; }
        public int? CVId { get; set; }

        // Navigation properties
        [ForeignKey("RecruiterId")]
        public virtual ApplicationUser Recruiter { get; set; } = null!;
        [ForeignKey("CVId")]
        public virtual CVUpload CV{ get; set; } = null!;
    }
}