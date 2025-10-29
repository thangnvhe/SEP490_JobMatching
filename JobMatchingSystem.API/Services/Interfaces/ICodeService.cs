using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface ICodeService
    {
        Task CreateCode(CreateCodeRequest request);
        Task<List<CodeDTO>> GetAllCode();
        Task<CodeDTO> GetCodeById(int codeId);
        Task UpdateCode(int codeId,UpdateCodeRequest code);
        Task DeleteCode(int codeId);
    }
}
