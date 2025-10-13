using JobMatchingSystem.Domain.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JobMatchingSystem.Domain.Entities
{
    public class Offer
    {
        [Key]
        public int OfferId { get; set; }
        public int CandidateId { get; set; }
        public int JobId { get; set; }
        public string? ContractPeriod { get; set; }
        public string? Notes { get; set; }
        public string? ContractType { get; set; }
        public string? Level { get; set; }
        public DateTime? DueDate { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public Decimal BasicSalary { get; set; } = new Decimal(0);
        public OfferStatus? Status { get; set; }
        // Navigation properties
        [ForeignKey("CandidateId")]
        public virtual ApplicationUser? Candidate { get; set; }
        [ForeignKey("JobId")]
        public virtual Job? Job { get; set; }
    }
}
