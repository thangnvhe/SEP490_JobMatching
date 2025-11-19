namespace JobMatchingSystem.API.DTOs.Response
{
    public class CVCertificateDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Organization { get; set; }
        public string? Link { get; set; }
        public string? Description { get; set; }
        public DateTime CertificateAt { get; set; }
    }
}
