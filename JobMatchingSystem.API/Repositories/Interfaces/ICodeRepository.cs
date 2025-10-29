using JobMatchingSystem.API.Entities;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface ICodeRepository
    {
        Task CreateCode(Code code);
        Task<List<Code>> GetAllCode(); 
        Task<Code?>GetCodeById(int id);
        Task UpdateCode(Code code);
        Task SoftDeleteCode(int codeId);
    }
}
