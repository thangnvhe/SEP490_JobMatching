using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface ICompanyRepository
    {
        Task<Company?> GetByIdAsync(int id);
        Task<Company?> GetByTaxCodeAsync(string taxCode);
        Task AddAsync(Company company);
        Task<List<Company>> GetAll(string search,string status,string sortBy,bool isDecending);
        Task<IEnumerable<Company>> GetAllAsync();
        Task Update(Company company);
        Task ChangeStatus(Company company);
    }
}
