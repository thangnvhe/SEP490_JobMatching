namespace JobMatchingSystem.API.DTOs
{
    public class CVResponse
    {
        public int CVId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string? FileUrl { get; set; }
        public bool IsPrimary { get; set; }
        public DateTime? CreatedAt { get; set; }

        // THÊM DÒNG NÀY:
        public DateTime? UpdatedAt { get; set; }
    }
}