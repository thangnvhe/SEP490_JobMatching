using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Models;
using Microsoft.AspNetCore.Identity;
using System.Globalization;
using System.Text;

namespace JobMatchingSystem.API.Data.SeedData
{
    public static class CandidateSeeder
    {
        public static async Task SeedCandidatesAsync(this WebApplication webApplication)
        {
            using var scope = webApplication.Services.CreateScope();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<int>>>();

            // 🔹 đảm bảo role Candidate tồn tại
            if (!await roleManager.RoleExistsAsync(Contraints.RoleCandidate))
            {
                await roleManager.CreateAsync(new IdentityRole<int>(Contraints.RoleCandidate));
            }

            var password = "Candidate123@";

            for (int i = 1; i <= 3; i++)
            {
                var email = $"candidate{i}@gmail.com";
                var existingUser = await userManager.FindByEmailAsync(email);
                if (existingUser != null)
                {
                    Console.WriteLine($"⚠️ User {email} already exists, skipping.");
                    continue;
                }

                var user = new ApplicationUser
                {
                    UserName = email,
                    Email = email,
                    FullName = $"Candidate {i}",
                    EmailConfirmed = true,
                    IsActive = true
                };

                var result = await userManager.CreateAsync(user, password);
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(user, Contraints.RoleCandidate);
                    Console.WriteLine($"✅ Seeded candidate: {email} / {password}");
                }
                else
                {
                    var errs = string.Join("; ", result.Errors.Select(e => e.Description));
                    Console.WriteLine($"❌ Failed to create {email}: {errs}");
                }
            }
        }
    }
}
