using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class CreateTaxonomyRequest
    {
        [Required(ErrorMessage = "Taxonomy name is required")]
        [StringLength(100, ErrorMessage = "Taxonomy name cannot exceed 100 characters")]
        public string Name { get; set; }
        
        public int? ParentId { get; set; }
    }
}