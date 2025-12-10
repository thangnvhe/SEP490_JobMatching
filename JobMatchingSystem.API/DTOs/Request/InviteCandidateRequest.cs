using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class InviteCandidateRequest
    {
        [Required]
        [EmailAddress]
        public string CandidateEmail { get; set; } = string.Empty;

        [Required]
        public int JobId { get; set; }

        public string? Message { get; set; }
    }
}