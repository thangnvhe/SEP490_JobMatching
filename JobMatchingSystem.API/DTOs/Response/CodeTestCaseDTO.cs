namespace JobMatchingSystem.API.DTOs.Response
{
    public class CodeTestCaseDTO
    {
        public int Id { get; set; }
        public int CodeId { get; set; }
        public string? InputData { get; set; }
        public string? ExpectedData { get; set; }
    }
}
