using JobMatchingSystem.API.Entities;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface ITemplateCVRepository
    {
        Task AddAsync(TemplateCV templateCV);
        Task<List<TemplateCV>> GetAllAsync();
        Task<TemplateCV?> GetByIdAsync(int id);
        Task UpdateAsync(TemplateCV templateCV);
    }
}