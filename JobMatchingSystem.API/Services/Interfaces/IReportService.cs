using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface IReportService
    {
        Task<Report> GetReportByIdAsync(int id);
        Task CensorReportAsync(int id, int adminId, CensorReportRequest request);
        Task CreateReportAsync(CreateReportRequest request, int userId);
        Task<PagedResult<ReportDetailResponse>> GetReportsPagedAsync(GetReportPagedRequest request);
    }
}
