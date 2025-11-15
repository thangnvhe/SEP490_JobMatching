using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface ITaxonomyRepository
    {
        Task<List<Taxonomy>> GetAllAsync();
    }
}
