using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface IExtensionJobRepository
    {
        Task<List<ExtensionJob>> GetByRecuiterIdAsync(int recuiterId);
    }
}
