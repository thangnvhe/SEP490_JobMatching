using JobMatchingSystem.API.DTOs.Response;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface IRecruiterDashboardService
    {
        Task<RecruiterDashboardResponse> GetDashboardAsync(int recruiterId, int month, int year);
    }

}
