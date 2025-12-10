using JobMatchingSystem.API.Enums;
using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class CreateReportRequest
    {
        [Required]
        public int JobId { get; set; }

        [Required]
        public ReportType Subject { get; set; }

        [Required]
        public string Reason { get; set; }
    }
}
