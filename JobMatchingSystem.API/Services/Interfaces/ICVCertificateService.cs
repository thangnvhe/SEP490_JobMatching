using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface ICVCertificateService
    {
        Task<CVCertificate> GetByIdAsync(int id);
        Task<List<CVCertificateDto>> GetByCurrentUserAsync(int userId);
        Task<CVCertificate> CreateAsync(CVCertificateRequest request, int userId);
        Task<CVCertificate> UpdateAsync(int id, CVCertificateRequest request, int userId);
        Task DeleteAsync(int id, int userId);
    }
}
