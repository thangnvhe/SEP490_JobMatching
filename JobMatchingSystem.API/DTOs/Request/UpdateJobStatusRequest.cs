using JobMatchingSystem.API.Enums;
using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class UpdateJobStatusRequest
    {
        public int StaffId { get; set; }

        [EnumDataType(typeof(JobStatus))]
        public JobStatus Status { get; set; }
    }
}
