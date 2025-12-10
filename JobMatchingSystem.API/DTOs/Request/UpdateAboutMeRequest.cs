using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class UpdateAboutMeRequest
    {
        [StringLength(2000, ErrorMessage = "Giới thiệu bản thân không được vượt quá 2000 ký tự")]
        public string? AboutMe { get; set; }
    }
}