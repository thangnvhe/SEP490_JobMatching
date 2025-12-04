using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.DTOs
{
    public class CVProfileRequest
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        public int PositionId { get; set; }

        public string? AboutMe { get; set; }
    }
}