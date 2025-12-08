using JobMatchingSystem.API.DTOs.Response;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface IAdminDashboardService
    {
        Task<AdminDashboardResponse> GetDashboardDataAsync(int month, int year);
    }
}
