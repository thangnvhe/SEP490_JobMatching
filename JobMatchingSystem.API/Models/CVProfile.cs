using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMatchingSystem.API.Models
{
    public class CVProfile
    {
        [Key]
        public int Id { get; set; }
        public int UserId { get; set; }
        public string? JobPosition { get; set; }
        public string? AboutMe { get; set; }
        // Navigation properties
        [ForeignKey("UserId")]
        public virtual ApplicationUser User { get; set; } = null!;
    }
}
