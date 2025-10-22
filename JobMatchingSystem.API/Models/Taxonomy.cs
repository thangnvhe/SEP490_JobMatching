using JobMatchingSystem.API.Enums;
using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.Entities
{
    public class Taxonomy
    {
        [Key]
        public int TaxonomyId { get; set; }

        public TaxonomyType Type { get; set; }

        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        public DateTime? CreatedAt { get; set; }

        public virtual ICollection<EntityTaxonomy> EntityTaxonomies { get; set; } = new List<EntityTaxonomy>();
    }
}