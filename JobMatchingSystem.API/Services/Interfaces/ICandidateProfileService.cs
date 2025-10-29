using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface ICandidateProfileService
    {
        Task<CandidateProfileResponse?> GetProfileByUserIdAsync(int userId);
        Task CreateProfileAsync(CreateOrUpdateCandidateProfileRequest request, int userId);
        Task UpdateProfileAsync(CreateOrUpdateCandidateProfileRequest request, int userId);
    }
}
