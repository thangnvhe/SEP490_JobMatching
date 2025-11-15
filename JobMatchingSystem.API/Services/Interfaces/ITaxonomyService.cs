using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface ITaxonomyService
    {
        Task<List<Taxonomy>> GetAllTaxonomiesAsync();
    }
}
