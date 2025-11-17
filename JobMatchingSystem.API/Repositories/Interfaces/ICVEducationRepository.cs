using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface ICVEducationRepository
    {
        Task<CVEducation?> GetByIdAsync(int id);
        Task<List<CVEducation>> GetByUserIdAsync(int userId);
        Task CreateAsync(CVEducation education);
        Task UpdateAsync(CVEducation education);
        Task DeleteAsync(CVEducation education);
    }
}
