using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using JobMatchingSystem.Domain.Enums;

namespace JobMatchingSystem.Domain.Entities
{
    public class Report
    {
        [Key]
        public int ReportId { get; set; }

        public int JobId { get; set; }
        public int ReporterId { get; set; }
        public string? Reason { get; set; }
        public ReportStatus Status { get; set; } = ReportStatus.Pending;
        public int? ReviewedById { get; set; }
        public string? ReviewNotes { get; set; }

        public DateTime? CreatedAt { get; set; }

        // Navigation properties
        [ForeignKey("JobId")]
        public virtual Job Job { get; set; } = null!;
        [ForeignKey("ReporterId")]
        public virtual ApplicationUser Reporter { get; set; } = null!;
        [ForeignKey("ReviewedById")]
        public virtual ApplicationUser? ReviewedBy { get; set; }
    }
}