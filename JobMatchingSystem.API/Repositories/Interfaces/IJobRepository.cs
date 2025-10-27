using JobMatchingSystem.API.Entities;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface IJobRepository
    {
        Task AddAsync(Job job);
        Task<Job?> GetByIdAsync(int id);
        Task UpdateAsync(Job job);
    }
}
