using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface ICVProjectService
    {
        Task<CVProject> GetByIdAsync(int id);
        Task<List<CVProject>> GetByCurrentUserAsync(int userId);
        Task<CVProject> CreateAsync(CVProjectRequest request, int userId);
        Task<CVProject> UpdateAsync(int id, CVProjectRequest request, int userId);
        Task DeleteAsync(int id, int userId);
    }
}
