using JobMatchingSystem.API.Entities;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface ITaxonomyService
    {
        Task<IEnumerable<Taxonomy>> GetAllSkillsAsync();
        Task<Taxonomy> GetSkillByIdAsync(int id);
    }
}
