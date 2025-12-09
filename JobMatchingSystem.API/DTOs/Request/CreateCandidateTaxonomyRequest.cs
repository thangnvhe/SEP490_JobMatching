namespace JobMatchingSystem.API.DTOs.Request
{
    public class CreateCandidateTaxonomyRequest
    {
        public int TaxonomyId { get; set; }
        public int? ExperienceYear { get; set; }
    }

    public class UpdateCandidateTaxonomyRequest
    {
        public int TaxonomyId { get; set; }
        public int? ExperienceYear { get; set; }
    }
}
