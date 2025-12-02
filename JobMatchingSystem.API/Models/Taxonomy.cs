using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMatchingSystem.API.Models
{
    public class Taxonomy
    {
        [Key]
        public int Id { get; set; }

        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        public int? ParentId { get; set; }

        // Navigation properties for tree structure
        [ForeignKey("ParentId")]
        public virtual Taxonomy? Parent { get; set; }
        
        public virtual ICollection<Taxonomy> Children { get; set; } = new List<Taxonomy>();
        
        // Navigation properties for existing relationships
        public virtual ICollection<CandidateTaxonomy> CandidateTaxonomies { get; set; } = new List<CandidateTaxonomy>();
        public virtual ICollection<JobTaxonomy> JobTaxonomies { get; set; } = new List<JobTaxonomy>();
    }
}