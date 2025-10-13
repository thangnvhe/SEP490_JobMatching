using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMatchingSystem.Domain.Entities
{
    public class DataCV
    {
        [Key]
        public int CVId { get; set; }

        public int UserId { get; set; }

        [MaxLength(150)]
        public string? Title { get; set; }

        public bool IsPrimary { get; set; } = false;
        public bool IsActive { get; set; } = true;

        [MaxLength(150)]
        public string? FileName { get; set; }

        [MaxLength(255)]
        public string? FileUrl { get; set; }

        public DateTime? CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public DateTime? DeletedAt { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual ApplicationUser User { get; set; } = null!;
        public virtual ICollection<SavedCV> SavedCVs { get; set; } = new List<SavedCV>();
        public virtual ICollection<CVExperience> CVExperiences { get; set; } = new List<CVExperience>();
        public virtual ICollection<CVEducation> CVEducations { get; set; } = new List<CVEducation>();
        public virtual ICollection<CVProject> CVProjects { get; set; } = new List<CVProject>();
        public virtual ICollection<CVCertificate> CVCertificates { get; set; } = new List<CVCertificate>();
        public virtual ICollection<CVAchievement> CVAchievements { get; set; } = new List<CVAchievement>();
        public virtual ICollection<CVSkill> CVSkills { get; set; } = new List<CVSkill>();
        public virtual ICollection<EntityTaxonomy> EntityTaxonomies { get; set; } = new List<EntityTaxonomy>();
    }
}