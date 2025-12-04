using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.Models
{
    public class Position
    {
        [Key]
        public int PositionId { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        // Navigation
        public virtual ICollection<Job> Jobs { get; set; } = new List<Job>();
        public virtual ICollection<CVProfile> CVProfiles { get; set; } = new List<CVProfile>();
    }
}
