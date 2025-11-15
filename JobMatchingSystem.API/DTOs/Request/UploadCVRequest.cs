namespace JobMatchingSystem.API.DTOs.Request
{
    public class UploadCVRequest
    {
        public string Name { get; set; }
        public bool? IsPrimary { get; set; } = false;
        public IFormFile File { get; set; }
    }
}
