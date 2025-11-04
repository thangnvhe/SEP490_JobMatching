using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Enums;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface IJobService
    {
        Task CreateJobAsync(CreateJobRequest request, int recruiterId);
        Task ReviewJobAsync(CensorJobRequest request, int staffId);
        Task<List<JobResponse>> GetAllJobsAsync(string? title, int? salaryMin, int? salaryMax, string? location, JobType? jobType, JobStatus? status, int? companyId, int? poster, List<int>? taxonomyIds);
    }
}
