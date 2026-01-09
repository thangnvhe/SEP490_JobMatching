using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface ISystemConfigService
    {
        Task<SystemConfigResponse> GetByIdAsync(int id);
        Task<List<SystemConfigResponse>> GetAllAsync();
        Task CreateAsync(CreateSystemConfigRequest request);
        Task UpdateAsync(int id, UpdateSystemConfigRequest request);
    }
}
