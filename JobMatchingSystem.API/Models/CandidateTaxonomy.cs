using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.Models
{
    public class CandidateTaxonomy
    {
        [Key]
        public int Id { get; set; }
        public int CandidateId { get; set; }
        public int TaxonomyId { get; set; }
        public int? ExperienceYear { get; set; }
        // Navigation properties
        public virtual ApplicationUser? Candidate { get; set; }
        public virtual Taxonomy? Taxonomy { get; set; }
    }
}
