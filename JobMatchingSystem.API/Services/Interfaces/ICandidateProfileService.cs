using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface ICandidateProfileService
    {
        Task<CandidateProfileResponse?> GetProfileByUserIdAsync(int userId);
        Task CreateOrUpdateProfileAsync(CreateOrUpdateCandidateProfileRequest request, int userId);
    }
}
