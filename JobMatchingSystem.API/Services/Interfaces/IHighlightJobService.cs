using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface IHighlightJobService
    {
        Task<List<HighlightJob>> GetHighlightJobsByUserAsync(int userId);
    }
}
