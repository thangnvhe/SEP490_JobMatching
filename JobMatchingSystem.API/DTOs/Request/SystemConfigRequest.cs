namespace JobMatchingSystem.API.DTOs.Request
{
    public class CreateSystemConfigRequest
    {
        public string Type { get; set; }
        public string Name { get; set; }
        public string Value { get; set; }
    }

    public class UpdateSystemConfigRequest
    {
        public string Value { get; set; }
    }
}
