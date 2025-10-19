using JobMatchingSystem.Domain.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JobMatchingSystem.Domain.Entities
{
    public class ReportSolved
    {
        public int ReportSolvedId { get; set; }
        public int SolvedBy { get; set; }
        public ReportStatus Status { get; set; } = ReportStatus.Investigate;
        public string? Notes { get; set; }
        public DateTime? SolvedDate { get; set; }

        [ForeignKey("SolvedBy")]
        public virtual ApplicationUser? User { get; set; }
        // Navigation Reports
        public virtual ICollection<Report> Reports { get; set; } = new List<Report>();
    }
}
