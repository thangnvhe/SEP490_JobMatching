using JobMatchingSystem.API.Entities;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface ICompanyRecruiterRepository
    {
        Task AddAsync(CompanyRecruiter companyRecruiter);
    }
}
