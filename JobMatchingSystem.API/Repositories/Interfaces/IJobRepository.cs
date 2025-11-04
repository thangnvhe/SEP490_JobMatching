using JobMatchingSystem.API.Entities;
using JobMatchingSystem.API.Enums;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface IJobRepository
    {
        Task AddAsync(Job job);
        Task<Job?> GetByIdAsync(int id);
        Task UpdateAsync(Job job);
        Task<List<Job>> GetAllAsync(string? title, int? salaryMin, int? salaryMax, string? location, JobType? jobType, JobStatus? status, int? companyId, int? poster, List<int>? taxonomyIds);
    }
}
