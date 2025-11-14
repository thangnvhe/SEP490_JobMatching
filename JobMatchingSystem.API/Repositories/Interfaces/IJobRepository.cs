using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface IJobRepository
    {
        Task CreateAsync(Job job);
    }
}
