using Newtonsoft.Json.Linq;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class CreateCodeTestCaseRequest
    {
        public int CodeId { get; set; }
        public string InputData { get; set; }
        public string? ExpectedData { get; set; }
    }
}
