using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.Models
{
    public class JobTaxonomy
    {
        [Key]
        public int Id { get; set; }
        public int JobId { get; set; }
        public int TaxonomyId { get; set; }
        // Navigation properties
        public virtual Job? Job { get; set; }
        public virtual Taxonomy? Taxonomy { get; set; }
    }
}
