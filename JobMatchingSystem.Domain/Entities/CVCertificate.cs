using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMatchingSystem.Domain.Entities
{
    public class CVCertificate
    {
        [Key]
        public int Id { get; set; }

        public int? CVId { get; set; }
        public int? userId { get; set; }

        [MaxLength(150)]
        public string? Name { get; set; }

        [MaxLength(150)]
        public string? IssuedBy { get; set; }

        public DateTime? IssuedDate { get; set; }

        public DateTime? ExpirationDate { get; set; }

        // Navigation properties
        [ForeignKey("CVId")]
        public virtual DataCV DataCV { get; set; } = null!;
        [ForeignKey("userId")]
        public virtual ApplicationUser User { get; set; } = null!;
    }
}