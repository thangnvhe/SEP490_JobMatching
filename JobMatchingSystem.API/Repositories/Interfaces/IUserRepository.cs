using JobMatchingSystem.API.Entities;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface IUserRepository
    {
        Task<ApplicationUser?> GetByIdAsync(int id);
        Task UpdateAsync(ApplicationUser user);
    }
}
