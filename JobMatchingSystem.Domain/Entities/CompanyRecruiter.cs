using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMatchingSystem.Domain.Entities
{
    public class CompanyRecruiter
    {
        [Key]
        public int Id { get; set; }

        public int CompanyId { get; set; }

        public int UserId { get; set; }

        public DateTime? JoinedAt { get; set; }

        public bool IsActive { get; set; } = true;

        // Navigation properties
        [ForeignKey("CompanyId")]
        public virtual Company Company { get; set; } = null!;

        [ForeignKey("UserId")]
        public virtual ApplicationUser User { get; set; } = null!;
    }
}