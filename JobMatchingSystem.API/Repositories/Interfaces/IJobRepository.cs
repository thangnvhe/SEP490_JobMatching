using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface IJobRepository
    {
        Task CreateAsync(Job job);
        Task<Job?> GetById(int id);
        Task UpdateAsync(Job job);
        Task<List<Job>> GetAllJobsPaged(GetJobPagedRequest request);
        Task<(List<Job> jobs, int totalCount)> GetAllJobsPagedWithCount(GetJobPagedRequest request);
    }
}
