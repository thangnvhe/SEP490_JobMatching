// File: DTOs/Request/CreateCVRequest.cs
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class CreateCVRequest
    {
        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public IFormFile File { get; set; } = null!;
    }
}