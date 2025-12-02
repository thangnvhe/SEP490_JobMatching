using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface ITaxonomyRepository
    {
        Task<List<Taxonomy>> GetAllAsync();
        Task<List<Taxonomy>> GetAllWithChildrenAsync();
        Task<List<Taxonomy>> GetAllWithParentAsync();
        Task<List<Taxonomy>> GetChildrenByParentIdAsync(int parentId);
        Task<Taxonomy?> GetByIdAsync(int id);
        Task<List<Taxonomy>> GetRootTaxonomiesAsync();
    }
}
