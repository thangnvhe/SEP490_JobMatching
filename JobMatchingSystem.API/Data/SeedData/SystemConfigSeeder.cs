using JobMatchingSystem.API.Models;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Data.SeedData
{
    public static class SystemConfigSeeder
    {
        public static async Task SeedSystemConfigsAsync(this WebApplication webApplication)
        {
            using var scope = webApplication.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // Check nếu đã có dữ liệu thì không seed nữa
            if (await db.SystemConfigs.AnyAsync())
            {
                Console.WriteLine("ℹ️ SystemConfigs already exist. Skipping seeding.");
                return;
            }

            var systemConfigs = new List<SystemConfig>
            {
                // ===== JOB CONFIG =====
                new() { Type = "job", Name = "JobQuota", Value = "5" },
                new() { Type = "job", Name = "SaveCV", Value = "100" },

                // ===== COMPANY REPORT PENALTY =====
                new() { Type = "report_company", Name = "Fraudulent", Value = "15" },
                new() { Type = "report_company", Name = "Spam", Value = "5" },
                new() { Type = "report_company", Name = "Inappropriate", Value = "8" },
                new() { Type = "report_company", Name = "Other", Value = "6" },

                // ===== REPORTER PENALTY =====
                new() { Type = "report_reporter", Name = "Fraudulent", Value = "8" },
                new() { Type = "report_reporter", Name = "Spam", Value = "3" },
                new() { Type = "report_reporter", Name = "Inappropriate", Value = "5" },
                new() { Type = "report_reporter", Name = "Other", Value = "4" },

                // ===== EducationLevel =====
                new() { Type = "education_level", Name = "Cao đẳng", Value = "1" },
                new() { Type = "education_level", Name = "Đại học", Value = "2" },
                new() { Type = "education_level", Name = "Kỹ sư", Value = "2" },
                new() { Type = "education_level", Name = "Cử nhân", Value = "2" },
                new() { Type = "education_level", Name = "Thạc sĩ", Value = "3" },
                new() { Type = "education_level", Name = "Tiến sĩ", Value = "4" },
            };

            await db.SystemConfigs.AddRangeAsync(systemConfigs);
            await db.SaveChangesAsync();

            Console.WriteLine($"✅ Seeded {systemConfigs.Count} SystemConfigs successfully.");
        }
    }
}
