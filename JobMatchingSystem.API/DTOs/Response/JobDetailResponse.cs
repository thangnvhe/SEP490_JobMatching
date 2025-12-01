namespace JobMatchingSystem.API.DTOs.Response
{
    public class JobDetailResponse
    {
        public int JobId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Requirements { get; set; }
        public string Benefits { get; set; }
        public int? SalaryMin { get; set; }
        public int? SalaryMax { get; set; }
        public string Location { get; set; }
        public int? ExperienceYear { get; set; }
        public string JobType { get; set; }
        public string Status { get; set; }
        public int? PositionId { get; set; }
        public int ViewsCount { get; set; }
        public int CompanyId { get; set; }
        public int RecuiterId { get; set; }
        public int? VerifiedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? OpenedAt { get; set; }
        public DateTime? ExpiredAt { get; set; }
        public bool? IsDeleted { get; set; }
        public List<TaxonomyResponse> Taxonomies { get; set; } = new();
        
        // Các trường mới cho logic FE
        public bool IsReport { get; set; } = false;
        public bool IsApply { get; set; } = false;
        public bool IsSave { get; set; } = false;
        public int ApplyCount { get; set; } = 0;
    }
}
