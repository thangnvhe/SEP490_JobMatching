using Microsoft.AspNetCore.Builder;
using System.Threading.Tasks;

namespace JobMatchingSystem.API.Data.SeedData
{
    public static class SeedDatabase
    {
        public static async Task SeedAllData(this WebApplication webApplication)
        {
            await CompanySeeder.SeedCompaniesAsync(webApplication);
            await RecruiterSeeder.SeedRecruitersAsync(webApplication);
            await CandidateSeeder.SeedCandidatesAsync(webApplication);
            await TaxonomySeeder.SeedTaxonomiesAsync(webApplication);          
            await JobSeeder.SeedJobAsync(webApplication);
            await JobQuotaSeeder.SeedJobQuotasAsync(webApplication);
            await CVSeeder.SeedCVUploadsAsync(webApplication);
            await ServicePlanSeeder.SeedServicePlansAsync(webApplication);
        }
    }
}
