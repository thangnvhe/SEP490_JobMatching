using JobMatchingSystem.API.Enums;
using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class CensorJobRequest
    {
        [Required]
        public int JobId { get; set; }

        [Required]
        [EnumDataType(typeof(JobStatus))]
        public JobStatus Status { get; set; }
    }
}
