using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.Entities
{
    public class TemplateCV
    {
        [Key]
        public int TemplateId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public bool? IsActive { get; set; }
        public string? PathUrl { get; set; }

        public DateTime? CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

    }
}