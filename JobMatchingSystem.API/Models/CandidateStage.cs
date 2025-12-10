using JobMatchingSystem.API.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JobMatchingSystem.API.Models
{
    public class CandidateStage
    {
        [Key]
        public int Id { get; set; }
        public int CandidateJobId { get; set; }
        public int JobStageId { get; set; }
        public CandidateStageStatus? Status { get; set; } = CandidateStageStatus.Draft;
        
        // Interview scheduling fields
        public DateOnly? InterviewDate { get; set; } // Ngày phỏng vấn
        public TimeOnly? InterviewStartTime { get; set; } // Thời gian bắt đầu
        public TimeOnly? InterviewEndTime { get; set; } // Thời gian kết thúc
        
        public string? InterviewLocation { get; set; } // Địa chỉ nơi phỏng vấn
        public string? GoogleMeetLink { get; set; } // Link Google Meet cho phỏng vấn online
        public string? HiringManagerFeedback { get; set; } // Đánh giá của Hiring Manager
        public DateTime? NotificationSentAt { get; set; } // Thời điểm gửi email thông báo phỏng vấn
        public string? ConfirmationToken { get; set; } // Token để xác thực confirm/reject (GUID)
        public bool? IsConfirmed { get; set; } // Ứng viên đã xác nhận tham gia phỏng vấn chưa
        
        // Navigation properties
        [ForeignKey("CandidateJobId")]
        public virtual CandidateJob? CandidateJob { get; set; } = null;
        [ForeignKey("JobStageId")]
        public virtual JobStage? JobStage { get; set; } = null;

    }
}
