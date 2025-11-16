using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface ICVService
    {
        Task UploadCVAsync(UploadCVRequest request, int userId);
        Task<CVUpload> GetCVByIdAsync(int id);
        Task<List<CVUpload>> GetCVsByUserIdAsync(int userId);
        Task DeleteCVAsync(int cvId, int userId);
    }
}
