using JobMatchingSystem.API.Enums;
using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class CensorJobRequest
    {
        [Required]
        public int Status { get; set; }
    }
}
