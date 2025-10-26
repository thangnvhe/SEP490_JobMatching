using JobMatchingSystem.API.DTOs.Request;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface ICompanyService
    {
        Task CreateCompanyAsync(RegisterRecruiterRequest request);
        Task AcceptCompanyAsync(AccepRejectCompanyRequest request, int userId);
        Task RejectCompanyAsync(AccepRejectCompanyRequest request, int userId);
    }
}
