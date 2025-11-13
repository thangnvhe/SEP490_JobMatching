using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMatchingSystem.API.Models
{
    public class CVExperience
    {
        [Key]
        public int Id { get; set; }
        public int UserId { get; set; }
        public string CompanyName { get; set; }
        public string Position { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public string? Description { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual ApplicationUser User { get; set; } = null!;
    }
}