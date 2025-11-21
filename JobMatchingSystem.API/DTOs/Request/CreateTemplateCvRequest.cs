using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class CreateTemplateCvRequest
    {
        [Required]
        public string Name { get; set; }

        [Required]
        public IFormFile File { get; set; } // upload từ form (multipart/form-data)
        
        public IFormFile? ImageFile { get; set; } // preview image (optional)
    }
}
