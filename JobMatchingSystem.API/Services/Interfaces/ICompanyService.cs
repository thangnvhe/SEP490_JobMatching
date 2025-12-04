using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface ICompanyService 
    {
        Task Add(CreateCompanyRequest request);
        Task RejectCompany(int id,int verifyBy,string reason);
        Task AcceptCompany(int id,int verifyBy);
        Task<CompanyDTO> GetDetailCompany(int companyId);
        Task<PagedResult<CompanyDTO>> GetDetailCompanyList(int page = 1, int size = 5, string search = "", string sortBy = "", bool isDecending = false,string status="");
        Task<IEnumerable<CompanyDTO>> GetAllCompaniesAsync();
        Task ChangeStatus(int companyId);
        Task UpdateCompany(UpdateCompanyRequest request,int companyId);
        Task<CompanyDTO> GetMyCompanyAsync(int recruiterId);

    }
}
