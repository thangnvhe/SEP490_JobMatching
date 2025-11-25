using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Data.SeedData
{
    public static class JobQuotaSeeder
    {
        public static async Task SeedJobQuotasAsync(this WebApplication webApplication)
        {
            using var scope = webApplication.Services.CreateScope();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // Lấy tất cả recruiter
            var recruiters = await userManager.GetUsersInRoleAsync(Contraints.RoleRecruiter);

            if (recruiters == null || recruiters.Count == 0)
            {
                Console.WriteLine("⚠️ No recruiters found to seed JobQuota.");
                return;
            }

            foreach (var recruiter in recruiters)
            {
                // Check nếu recruiter đã có quota thì bỏ qua
                bool hasQuota = await db.JobQuotas.AnyAsync(q => q.RecruiterId == recruiter.Id);
                if (hasQuota)
                    continue;

                // Create new quota
                var quota = new JobQuota
                {
                    RecruiterId = recruiter.Id,
                    MonthlyQuota = 5,
                    ExtraQuota = 0
                };

                await db.JobQuotas.AddAsync(quota);
                Console.WriteLine($"✅ Created JobQuota for recruiter: {recruiter.Email}");
            }

            await db.SaveChangesAsync();
        }
    }
}
