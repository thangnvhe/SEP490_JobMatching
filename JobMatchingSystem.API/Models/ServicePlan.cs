using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMatchingSystem.API.Models
{
    public class ServicePlan
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        public int? JobPostAdditional { get; set; }

        public int? HighlightJobDays { get; set; }
        public int? HighlightJobDaysCount { get; set; }

        public int? ExtensionJobDays { get; set; }
        public int? ExtensionJobDaysCount { get; set; }

        public int? CVSaveAdditional { get; set; }

        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}
