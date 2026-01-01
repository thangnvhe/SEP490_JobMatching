using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface IEducationLevelService
    {
        Task<List<EducationLevelDto>> GetAllAsync();
        Task<EducationLevelDto> GetByIdAsync(int id);
        Task<PagedResult<EducationLevelDto>> GetAllPagedAsync(int page, int pageSize, string sortBy, bool isDescending, string search);
        Task<EducationLevel> CreateAsync(CreateEducationLevelRequest request);
        Task<EducationLevel> UpdateAsync(int id, UpdateEducationLevelRequest request);
    }
}