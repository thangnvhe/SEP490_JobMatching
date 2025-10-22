using JobMatchingSystem.API.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JobMatchingSystem.API.Entities
{
    public class CandidateStage
    {
        [Key]
        public int Id { get; set; }
        public int CandidateJobId { get; set; }
        public int JobStageId { get; set; }
        public CandidateStageStatus? Status { get; set; } = CandidateStageStatus.Pending;
        public string? InterviewerName { get; set; }
        public int? CodeId { get; set; }
        public DateTime? ScheduleTime { get; set; }
        // Navigation properties
        [ForeignKey("CandidateJobId")]
        public virtual CandidateJob? CandidateJob { get; set; } = null;
        [ForeignKey("CodeId")]
        public virtual Code? Code { get; set; } = null;
        [ForeignKey("JobStageId")]
        public virtual JobStage? JobStage { get; set; } = null;

    }
}
