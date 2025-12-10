using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Models;
using Microsoft.AspNetCore.Http;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface ICVService
    {
        Task UploadCVAsync(UploadCVRequest request, int userId);
        Task<CVUpload> GetCVByIdAsync(int id);
        Task<List<CVUpload>> GetCVsByUserIdAsync(int userId);
        Task<List<CVDetailResponse>> GetAllCVsAsync();
        Task DeleteCVAsync(int cvId, int userId);
        Task SetPrimaryCVAsync(int cvId, int userId);
        Task<CVValidationResponse> ValidateCVAsync(IFormFile file);
        Task CleanupUserCVsAsync(int userId);
    }
}
