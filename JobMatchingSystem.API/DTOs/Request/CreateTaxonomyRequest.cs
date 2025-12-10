using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class CreateTaxonomyRequest
    {
        [Required(ErrorMessage = "Tên phân loại không được để trống")]
        [StringLength(100, ErrorMessage = "Tên phân loại không được vượt quá 100 ký tự")]
        public string Name { get; set; }
        
        public int? ParentId { get; set; }
    }
}