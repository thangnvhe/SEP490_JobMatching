namespace JobMatchingSystem.API.DTOs.Response
{
    public class CandidateTaxonomyResponse
    {
        public int Id { get; set; }
        public int CandidateId { get; set; }
        public int TaxonomyId { get; set; }
        public string? TaxonomyName { get; set; }
        public int? ExperienceYear { get; set; }
    }
}
