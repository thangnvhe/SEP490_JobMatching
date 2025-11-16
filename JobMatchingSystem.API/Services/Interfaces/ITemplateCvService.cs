using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Models;
using System.Threading.Tasks;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface ITemplateCvService
    {
        Task CreateTemplateAsync(CreateTemplateCvRequest request);
        Task<List<TemplateCV>> GetAllAsync();
        Task<TemplateCV> GetByIdAsync(int id);
        Task DeleteAsync(int id);
    }
}
