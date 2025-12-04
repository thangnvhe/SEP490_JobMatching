using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class SelectPositionRequest
    {
        [Required(ErrorMessage = "Position ID is required")]
        [Range(1, int.MaxValue, ErrorMessage = "Position ID must be greater than 0")]
        public int PositionId { get; set; }
    }
}