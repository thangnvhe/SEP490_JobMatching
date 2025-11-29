using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class HighlightJobService : IHighlightJobService
    {
        private readonly IHighlightJobRepository _highlightJobRepository;

        public HighlightJobService(IHighlightJobRepository highlightJobRepository)
        {
            _highlightJobRepository = highlightJobRepository;
        }

        public async Task<List<HighlightJob>> GetHighlightJobsByUserAsync(int userId)
        {
            return await _highlightJobRepository.GetByRecuiterIdAsync(userId);
        }
    }
}
