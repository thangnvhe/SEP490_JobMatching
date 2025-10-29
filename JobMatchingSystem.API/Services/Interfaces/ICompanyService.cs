using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface ICompanyService
    {
        Task CreateCompanyAsync(RegisterRecruiterRequest request);
        Task AcceptCompanyAsync(AccepRejectCompanyRequest request, int userId);
        Task RejectCompanyAsync(AccepRejectCompanyRequest request, int userId);
        Task<List<CompanyDTO>> GetAllWithPending();
        Task<CompanyDTO> GetDetailCompany(int companyId);
    }
}
