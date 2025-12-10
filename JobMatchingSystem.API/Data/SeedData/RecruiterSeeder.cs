using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Models;
using Microsoft.AspNetCore.Identity;
using System.Globalization;
using System.Text;

namespace JobMatchingSystem.API.Data.SeedData
{
    public static class RecruiterSeeder
    {
        public static async Task SeedRecruitersAsync(this WebApplication webApplication)
        {
            using var scope = webApplication.Services.CreateScope();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<int>>>();

            // nếu đã có ít nhất 1 recruiter thì thôi
            if (await userManager.GetUsersInRoleAsync(Contraints.RoleRecruiter) is { Count: > 0 })
                return;

            // đảm bảo role recruiter tồn tại
            if (!await roleManager.RoleExistsAsync(Contraints.RoleRecruiter))
                await roleManager.CreateAsync(new IdentityRole<int>(Contraints.RoleRecruiter));

            var testPassword = "Recruiter123@";

            for (int i = 1; i <= 3; i++)
            {
                var email = $"recruiter{i}@example.com";

                // kiểm tra nếu đã tồn tại thì bỏ qua
                if (await userManager.FindByEmailAsync(email) != null)
                    continue;

                var recruiterUser = new ApplicationUser
                {
                    UserName = email,
                    Email = email,
                    FullName = $"Test Recruiter {i}",
                    EmailConfirmed = true,
                    IsActive = true,
                    AccessFailedCount = 0,
                    CompanyId = i,
                };

                var createResult = await userManager.CreateAsync(recruiterUser, testPassword);
                if (createResult.Succeeded)
                {
                    await userManager.AddToRoleAsync(recruiterUser, Contraints.RoleRecruiter);
                    Console.WriteLine($"✅ Test recruiter created: {email} / {testPassword}");
                }
                else
                {
                    var errs = string.Join("; ", createResult.Errors.Select(e => e.Description));
                    Console.WriteLine($"❌ Failed to create recruiter {email}: {errs}");
                }
            }
        }
    }
}

