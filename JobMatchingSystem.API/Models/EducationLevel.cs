using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.Models
{
    public class EducationLevel
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string LevelName { get; set; } = string.Empty;
        
        [Required]
        public int RankScore { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        // Navigation properties
        public virtual ICollection<CVEducation> CVEducations { get; set; } = new List<CVEducation>();
        public virtual ICollection<Job> Jobs { get; set; } = new List<Job>();
    }
}