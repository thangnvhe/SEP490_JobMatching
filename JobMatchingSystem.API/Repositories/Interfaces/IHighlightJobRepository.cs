using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface IHighlightJobRepository
    {
        Task<List<HighlightJob>> GetByRecuiterIdAsync(int recuiterId);
    }
}
