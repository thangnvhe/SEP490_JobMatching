using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface ITemplateCVService
    {
        Task CreateTemplateCVAsync(CreateTemplateCVRequest request, IFormFile file);
        Task<List<TemplateCVResponse>> GetAllTemplateCVsAsync();
        Task<TemplateCVResponse?> GetTemplateCVByIdAsync(int id);
        Task UpdateTemplateCVAsync(int id, UpdateTemplateCVRequest request, IFormFile? file);
    }
}
