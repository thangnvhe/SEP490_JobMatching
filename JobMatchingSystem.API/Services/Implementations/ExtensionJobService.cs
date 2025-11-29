using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class ExtensionJobService : IExtensionJobService
    {
        private readonly IExtensionJobRepository _extensionJobRepository;

        public ExtensionJobService(IExtensionJobRepository extensionJobRepository)
        {
            _extensionJobRepository = extensionJobRepository;
        }

        public async Task<List<ExtensionJob>> GetExtensionJobsByUserAsync(int userId)
        {
            return await _extensionJobRepository.GetByRecuiterIdAsync(userId);
        }
    }
}
