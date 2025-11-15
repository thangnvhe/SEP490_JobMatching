using JobMatchingSystem.API.Models;
using System.Threading.Tasks;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface ITemplateCvRepository
    {
        Task CreateAsync(TemplateCV template);
        Task<List<TemplateCV>> GetAllAsync();
        Task<TemplateCV?> GetByIdAsync(int id);
        Task DeleteAsync(TemplateCV template);
    }
}
