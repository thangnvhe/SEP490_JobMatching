using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface ICodeTestService
    {
        Task CreateCodeTest(CreateCodeTestCaseRequest request);
        Task<List<CodeTestCaseDTO>> GetAllCodeTestCase();
        Task<List<CodeTestCaseDTO>> GetAllCodeTestCaseByCodeId(int codeId);
        Task<CodeTestCaseDTO> GetCodeTestCaseById(int codeId);
        Task UpdateCodeTestCase(int codeId, UpdateCodeTestCaseRequest code);
        Task DeleteCodeTestCase(int codeId);
    }
}
