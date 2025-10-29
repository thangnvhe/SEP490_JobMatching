using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Entities;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface ICodeTestRepository
    {
        Task CreateCodeTest(CodeTestCase codeTestCase);
    }
}
