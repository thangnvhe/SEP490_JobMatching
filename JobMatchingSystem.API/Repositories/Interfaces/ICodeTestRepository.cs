using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Entities;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface ICodeTestRepository
    {
        Task CreateCodeTest(CodeTestCase codeTestCase);
        Task UpdateCodeTest(CodeTestCase codeTestCase);
        Task<List<CodeTestCase>> GetAllCodeTestCases();
        Task DeleteCodeTest(CodeTestCase code);
        Task<CodeTestCase?> GetTestCaseById(int id);
        Task<List<CodeTestCase>>GetAllTestCaseByCodeID(int codeID);
        
    }
}
