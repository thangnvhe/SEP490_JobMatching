using JobMatchingSystem.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMatchingSystem.Domain.Entities
{
    public class EntityTaxonomy
    {
        [Key]
        public int Id { get; set; }

        public EntityType EntityType { get; set; }

        public int EntityId { get; set; }

        public int TaxonomyId { get; set; }

        public DateTime? CreatedAt { get; set; }

        // Navigation properties
        [ForeignKey("TaxonomyId")]
        public virtual Taxonomy Taxonomy { get; set; } = null!;
    }
}