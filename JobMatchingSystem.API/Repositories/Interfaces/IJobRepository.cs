using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface IJobRepository
    {
        Task CreateAsync(Job job);
        Task<List<Job>> GetJobsAsync(GetJobRequest request);
    }
}
