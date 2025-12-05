using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class UpdatePositionRequest
    {
        [Required(ErrorMessage = "Position name is required")]
        [StringLength(100, ErrorMessage = "Position name cannot exceed 100 characters")]
        public string Name { get; set; }
        
    }
}