// DTOs/Request/CreateCVFromTemplateRequest.cs
using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class CreateCVFromTemplateRequest
    {
        [Required]
        public int TemplateId { get; set; }
    }
}