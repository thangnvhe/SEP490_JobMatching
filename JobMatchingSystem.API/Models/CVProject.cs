using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMatchingSystem.API.Entities
{
    public class CVProject
    {
        [Key]
        public int Id { get; set; }

        public int? CVId { get; set; }
        public int? UserId { get; set; }
        public string ProjectName { get; set; }
        public string? Description { get; set; }
        public string? Role { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        [ForeignKey("CVId")]
        public virtual DataCV DataCV { get; set; } = null!;
        [ForeignKey("UserId")]
        public virtual ApplicationUser User { get; set; } = null!;
    }
}