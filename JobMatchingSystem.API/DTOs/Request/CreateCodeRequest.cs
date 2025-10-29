using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class CreateCodeRequest
    {
        [Required]
        public string Title { get; set; }
        [Required]
        public string Description { get; set; }
        public IFormFile? Images { get; set; }
        public string ParameterTypes { get; set; }
        public string ReturnType { get; set; }
    }
}
