namespace JobMatchingSystem.API.DTOs.Response
{
    public class JobTaxonomyResponse
    {
        public int Id { get; set; }
        public int JobId { get; set; }
        public int TaxonomyId { get; set; }
        public string? TaxonomyName { get; set; }
    }
}
