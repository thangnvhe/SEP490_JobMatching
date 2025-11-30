using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface IExtensionJobService
    {
        Task<List<ExtensionJob>> GetExtensionJobsByUserAsync(int userId);
    }
}
