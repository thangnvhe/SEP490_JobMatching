// File: DTOs/Request/GetJobPagedRequest.cs
using JobMatchingSystem.API.Enums;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class GetJobPagedRequest
    {
        public int page { get; set; } = 1;
        public int size { get; set; } = 10;
        public string? search { get; set; } = "";
        public string? sortBy { get; set; } = "";
        public bool isDescending { get; set; } = false;

        // Các filter hiện có
        public string? title { get; set; }
        public string? description { get; set; }
        public string? requirements { get; set; }
        public string? benefits { get; set; }
        public int? salaryMin { get; set; }
        public int? salaryMax { get; set; }
        public string? location { get; set; }
        public int? experienceYearMin { get; set; }
        public int? experienceYearMax { get; set; }
        public string? jobType { get; set; }
        public JobStatus? status { get; set; }
        public int? companyId { get; set; }
        public int? recuiterId { get; set; }
        public bool? isDeleted { get; set; }
        public List<int>? TaxonomyIds { get; set; }
    }
}