using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface IJobTaxonomyService
    {
        Task<JobTaxonomyResponse> GetByIdAsync(int id);
        Task<List<JobTaxonomyResponse>> GetByJobIdAsync(int jobId);
        Task CreateAsync(CreateJobTaxonomyRequest request, int userId);
        Task DeleteAsync(int id, int userId);
    }
}
