namespace JobMatchingSystem.API.DTOs.Request
{
    public class CVCertificateRequest
    {
        public string Name { get; set; }
        public string Organization { get; set; }
        public string? Link { get; set; }
        public string? Description { get; set; }
        public DateTime CertificateAt { get; set; }
    }
}
