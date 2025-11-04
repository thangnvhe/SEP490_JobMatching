using JobMatchingSystem.API.Entities;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface ITaxonomyRepository
    {
        Task<IEnumerable<Taxonomy>> GetAllSkillsAsync();
        Task<Taxonomy?> GetSkillByIdAsync(int id);
    }
}
