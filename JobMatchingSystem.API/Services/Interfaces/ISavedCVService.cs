using JobMatchingSystem.API.DTOs.Response;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface ISavedCVService
    {
        Task<IEnumerable<SavedCVResponse>> GetSavedCVsByRecruiterIdAsync(int recruiterId);
        Task<SavedCVResponse> GetSavedCVByIdAsync(int savedCVId, int recruiterId);
        Task CreateSavedCVAsync(int cvId, int recruiterId);
        Task DeleteSavedCVAsync(int savedCVId, int recruiterId);
    }
}
