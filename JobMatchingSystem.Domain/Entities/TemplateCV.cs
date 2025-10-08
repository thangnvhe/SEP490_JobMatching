using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.Domain.Entities
{
    public class TemplateCV
    {
        [Key]
        public int TemplateId { get; set; }

        [MaxLength(100)]
        public string? Name { get; set; }

        public string? Description { get; set; }

        [MaxLength(255)]
        public string? PreviewUrl { get; set; }

        public DateTime? CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public DateTime? DeletedAt { get; set; }
    }
}