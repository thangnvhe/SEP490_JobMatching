using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.Domain.Entities
{
    public class Feedback
    {
        [Key]
        public int FeedbackId { get; set; }

        [MaxLength(100)]
        public string? Name { get; set; }

        [MaxLength(100)]
        public string? Email { get; set; }

        [MaxLength(150)]
        public string? Subject { get; set; }

        public string? Message { get; set; }

        public DateTime? ReadAt { get; set; }

        public DateTime? CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public DateTime? DeletedAt { get; set; }
    }
}