using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Models;
using System.Threading.Tasks;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface ITemplateCvService
    {
        Task<APIResponse<TemplateCV>> CreateTemplateAsync(CreateTemplateCvRequest request);
        Task<APIResponse<PagedResult<TemplateCV>>> GetAllAsync(int page = 1, int pageSize = 10, string sortBy = "", bool isDescending = false);
        Task<APIResponse<TemplateCV>> GetByIdAsync(int id);
        Task<APIResponse<object>> DeleteAsync(int id);
    }
}
