namespace JobMatchingSystem.API.DTOs.Request
{
    public class UpdateCodeRequest
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public IFormFile? Images { get; set; }
        public string ParameterTypes { get; set; }
        public string ReturnType { get; set; }
    }
}
