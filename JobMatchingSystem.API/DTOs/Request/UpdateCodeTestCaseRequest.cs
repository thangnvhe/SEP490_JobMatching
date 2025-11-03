using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class UpdateCodeTestCaseRequest
    {
        public string InputData { get; set; }
        [Required]
        public string? ExpectedData { get; set; }
    }
}
