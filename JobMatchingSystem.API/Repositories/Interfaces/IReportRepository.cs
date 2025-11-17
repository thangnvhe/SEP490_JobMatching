using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface IReportRepository
    {
        Task CreateAsync(Report report);
    }
}
