namespace JobMatchingSystem.API.DTOs.Response
{
    public class CodeDTO
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Image { get; set; }
        public string ParameterTypes { get; set; }
        public string ReturnType { get; set; }
    }
}
