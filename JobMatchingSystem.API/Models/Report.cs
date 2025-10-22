using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using JobMatchingSystem.API.Enums;

namespace JobMatchingSystem.API.Entities
{
    public class Report
    {
        [Key]
        public int ReportId { get; set; }

        public int JobId { get; set; }
        public int ReporterId { get; set; }
        public int ReportSolvedId { get; set; }
        public ReportType? Subject { get; set; }
        public string? Reason { get; set; }
        public DateTime? CreatedAt { get; set; }

        // Navigation properties
        [ForeignKey("JobId")]
        public virtual Job Job { get; set; } = null!;
        [ForeignKey("ReporterId")]
        public virtual ApplicationUser Reporter { get; set; } = null!;
        [ForeignKey("ReportSolvedId")]
        public virtual ReportSolved? ReportSolved { get; set; }
    }
}