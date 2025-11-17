using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface IReportRepository
    {
        Task CreateAsync(Report report);
        Task<Report?> GetByIdAsync(int id);
        Task UpdateAsync(Report report);
        Task<List<Report>> GetAllReportsPagedAsync(GetReportPagedRequest request);
    }
}
