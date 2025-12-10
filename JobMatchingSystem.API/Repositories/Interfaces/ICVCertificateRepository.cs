using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface ICVCertificateRepository
    {
        Task<CVCertificate?> GetByIdAsync(int id);
        Task<List<CVCertificate>> GetByUserIdAsync(int userId);
        Task CreateAsync(CVCertificate certificate);
        Task UpdateAsync(CVCertificate certificate);
        Task DeleteAsync(CVCertificate certificate);
    }
}
