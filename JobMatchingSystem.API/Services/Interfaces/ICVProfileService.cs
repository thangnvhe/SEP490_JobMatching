using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface ICVProfileService
    {
        Task<CVProfile?> GetByIdAsync(int id);
        Task<CVProfile?> GetByUserIdAsync(int userId);
        Task<CVProfile> CreateAsync(CVProfileRequest request, int userId);
        Task<CVProfile> UpdateAsync(int id, CVProfileRequest request, int userId);
        Task DeleteAsync(int id, int userId);
        Task<CVProfile> UpdateAboutMeAsync(int userId, string aboutMe);
    }
}