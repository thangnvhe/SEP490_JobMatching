using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.Models
{
    public class Taxonomy
    {
        [Key]
        public int Id { get; set; }

        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        // Navigation properties
        public virtual ICollection<CandidateTaxonomy> CandidateTaxonomies { get; set; } = new List<CandidateTaxonomy>();
        public virtual ICollection<JobTaxonomy> JobTaxonomies { get; set; } = new List<JobTaxonomy>();
    }
}