using JobMatchingSystem.API.DTOs.Response;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface IHiringManagerDashboardService
    {
        Task<HiringManagerDashboardResponse> GetDashboardDataAsync(int hiringManagerId);
    }
}
