using JobMatchingSystem.API.DTOs.Request;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface ICodeTestService
    {
        Task CreateCodeTest(CreateCodeTestCaseRequest request);
    }
}
