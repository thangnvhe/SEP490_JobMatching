using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface ISystemConfigService
    {
        Task<SystemConfig> GetDefaultAsync();
        Task UpdateDefaultAsync(UpdateSystemConfigRequest request);
    }
}
