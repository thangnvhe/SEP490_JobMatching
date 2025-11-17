using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using JobMatchingSystem.API.Enums;

namespace JobMatchingSystem.API.Models
{
    public class Report
    {
        [Key]
        public int Id { get; set; }
        public int JobId { get; set; }
        public int ReporterId { get; set; }
        public int? VerifiedId { get; set; }
        public ReportType Subject { get; set; }
        public string Reason { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ReportStatus Status { get; set; } = ReportStatus.Pending;
        public string? Note { get; set; }   
        // Navigation properties
        [ForeignKey("JobId")]
        public virtual Job Job { get; set; } = null!;
        [ForeignKey("ReporterId")]
        public virtual ApplicationUser Reporter { get; set; } = null!;
        [ForeignKey("VerifiedId")]
        public virtual ApplicationUser? VerifiedBy { get; set; } = null;
    }
}