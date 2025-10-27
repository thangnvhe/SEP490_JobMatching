using JobMatchingSystem.API.Entities;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface ICandidateProfileRepository
    {
        Task<CandidateProfile?> GetByUserIdAsync(int userId);
        Task AddAsync(CandidateProfile profile);
        Task UpdateAsync(CandidateProfile profile);
    }
}
