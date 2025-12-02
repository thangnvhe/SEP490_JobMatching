using JobMatchingSystem.API.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMatchingSystem.API.Models
{
    public class CVEducation
    {
        [Key]
        public int Id { get; set; }
        public int UserId { get; set; }
        public string SchoolName { get; set; }
        public int EducationLevelId { get; set; }
        public string Major { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Description { get; set; }
        // Navigation properties
        [ForeignKey("UserId")]
        public virtual ApplicationUser User { get; set; } = null!;
         [ForeignKey("EducationLevelId")]
        public virtual EducationLevel EducationLevel { get; set; } = null!;
    }
}