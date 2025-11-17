using JobMatchingSystem.API.DTOs.Request;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface IReportService
    {
        Task CreateReportAsync(CreateReportRequest request, int userId);
    }
}
