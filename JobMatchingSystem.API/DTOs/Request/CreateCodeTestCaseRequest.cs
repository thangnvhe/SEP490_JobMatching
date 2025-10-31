using Newtonsoft.Json.Linq;
using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class CreateCodeTestCaseRequest
    {
        [Required]
        public int CodeId { get; set; }
        [Required]
        public string InputData { get; set; }
        [Required]
        public string? ExpectedData { get; set; }
    }
}
