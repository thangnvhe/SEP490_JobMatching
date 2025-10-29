using JobMatchingSystem.API.Entities;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface ICompanyRepository
    {
        Task<Company?> GetByIdAsync(int id);
        Task AddAsync(Company company);
        Task<List<Company>> GetAllWithPendingAsync();
        Task Update(Company company);
    }
}
