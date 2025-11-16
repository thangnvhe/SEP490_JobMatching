using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface ICVExperienceService
    {
        Task<CVExperience> GetByIdAsync(int id);
        Task<List<CVExperience>> GetByCurrentUserAsync(int userId);
        Task<CVExperience> CreateAsync(CVExperienceRequest request, int userId);
        Task<CVExperience> UpdateAsync(int id, CVExperienceRequest request, int userId);
        Task DeleteAsync(int id, int userId);
    }
}
