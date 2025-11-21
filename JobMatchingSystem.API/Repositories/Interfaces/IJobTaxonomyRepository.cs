using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface IJobTaxonomyRepository
    {
        Task<JobTaxonomy?> GetByIdAsync(int id);
        Task<List<JobTaxonomy>> GetByJobIdAsync(int jobId);
        Task CreateAsync(JobTaxonomy entity);
        Task DeleteAsync(JobTaxonomy entity);
        Task<bool> TaxonomyExistsAsync(int taxonomyId);
        Task<Job?> GetJobAsync(int jobId);
    }
}
