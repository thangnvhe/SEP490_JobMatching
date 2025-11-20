using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface ISavedJobService
    {
        Task<IEnumerable<SavedJobResponse>> GetSavedJobsByUserIdAsync(int userId);
        Task<SavedJobResponse> GetSavedJobByIdAsync(int savedJobId, int userId);
        Task CreateSavedJobAsync(int jobId, int userId);
        Task DeleteSavedJobAsync(int savedJobId, int userId);
    }
}
