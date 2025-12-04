using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class UpdateAboutMeRequest
    {
        [StringLength(2000, ErrorMessage = "About me cannot exceed 2000 characters")]
        public string? AboutMe { get; set; }
    }
}