using JobMatchingSystem.API.DTOs.Response;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface ICandidateDashboardService
    {
        Task<CandidateDashboardResponse> GetDashboardDataAsync(int candidateId);
    }
}
