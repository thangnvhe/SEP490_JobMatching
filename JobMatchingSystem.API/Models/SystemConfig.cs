using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.Models
{
    public class SystemConfig
    {
        [Key]
        public int Id { get; set; }

        public int JobQuota { get; set; }
        public int SaveCV { get; set; }

        // ===== COMPANY PENALTY =====
        public int CompanyFraudulentPenalty { get; set; } 
        public int CompanySpamPenalty { get; set; } 
        public int CompanyInappropriatePenalty { get; set; } 
        public int CompanyOtherPenalty { get; set; } 

        // ===== REPORTER PENALTY =====
        public int ReporterFraudulentPenalty { get; set; } 
        public int ReporterSpamPenalty { get; set; } 
        public int ReporterInappropriatePenalty { get; set; } 
        public int ReporterOtherPenalty { get; set; } 
    }
}
