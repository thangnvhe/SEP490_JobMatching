using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface ICVEducationService
    {
        Task<CVEducation> GetByIdAsync(int id);
        Task<List<CVEducation>> GetByCurrentUserAsync(int userId);
        Task<CVEducation> CreateAsync(CVEducationRequest request, int userId);
        Task<CVEducation> UpdateAsync(int id, CVEducationRequest request, int userId);
        Task DeleteAsync(int id, int userId);
    }
}
