using JobMatchingSystem.API.DTOs.Response;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface IEducationLevelService
    {
        Task<List<EducationLevelDto>> GetAllAsync();
        Task<EducationLevelDto> GetByIdAsync(int id);
    }
}