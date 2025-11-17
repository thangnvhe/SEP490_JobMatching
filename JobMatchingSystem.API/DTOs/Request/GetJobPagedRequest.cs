// File: DTOs/Request/GetJobPagedRequest.cs
using JobMatchingSystem.API.Enums;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class GetJobPagedRequest
    {
        public int Page { get; set; } = 1;
        public int Size { get; set; } = 10;
        public string? Search { get; set; } = "";
        public string? SortBy { get; set; } = "";
        public bool IsDescending { get; set; } = false;

        // Các filter hiện có
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Requirements { get; set; }
        public string? Benefits { get; set; }
        public int? SalaryMin { get; set; }
        public int? SalaryMax { get; set; }
        public string? Location { get; set; }
        public int? ExperienceYearMin { get; set; }
        public int? ExperienceYearMax { get; set; }
        public string? JobType { get; set; }
        public JobStatus? Status { get; set; }
        public int? CompanyId { get; set; }
        public int? RecuiterId { get; set; }
        public List<int>? TaxonomyIds { get; set; }
    }
}