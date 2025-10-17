using JobMatchingSystem.DataAccess.Data;
using JobMatchingSystem.Domain.Entities;
using JobMatchingSystem.Domain.Settings;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace JobMatchingSystem.DataAccess.Configuration
{
    public static class ConfigurationService
    {
        public static async Task AutoMigration(this WebApplication webApplication)
        {
            using (var scope = webApplication.Services.CreateScope())
            {
                var appContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                await appContext.Database.MigrateAsync();
            }
        }

        public static async Task SeedAdminUserAsync(this WebApplication webApplication)
        {
            using var scope = webApplication.Services.CreateScope();

            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<int>>>();
            var appContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            string[] roles = new[]
                                {
                                Contraints.RoleAdmin,
                                Contraints.RoleRecruiter,
                                Contraints.RoleCandidate,
                                Contraints.RoleStaff
                                };

            // ✅ Tạo role nếu chưa có
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole<int>(role));
                }
            }

            // ✅ Tạo user admin nếu chưa có
            var adminEmail = "admin123@gmail.com";
            var adminUser = await userManager.FindByEmailAsync(adminEmail);

            if (adminUser == null)
            {
                var newAdmin = new ApplicationUser
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    FullName = "Admin",
                    PhoneNumber = "0123456789",
                    EmailConfirmed = true,
                    IsActive = true,
                    AccessFailedCount = 0
                };

                var createResult = await userManager.CreateAsync(newAdmin, "Admin123@");

                if (createResult.Succeeded)
                {
                    await userManager.AddToRoleAsync(newAdmin, Contraints.RoleAdmin);
                }
                else
                {
                    var errors = string.Join(", ", createResult.Errors.Select(e => e.Description));
                    Console.WriteLine($"❌ Seed admin failed: {errors}");
                }
            }
        }
        //public static void SeedAdminUser(this WebApplication webApplication)
        //{
        //    using (var scope = webApplication.Services.CreateScope())
        //    {
        //        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        //        var appContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        //        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<int>>>();
        //        //check roles were created
        //        if (!roleManager.RoleExistsAsync(Contraints.RoleAdmin).GetAwaiter().GetResult())
        //        {
        //            //create roles
        //            roleManager.CreateAsync(new IdentityRole<int>(Contraints.RoleAdmin)).GetAwaiter().GetResult();
        //            roleManager.CreateAsync(new IdentityRole<int>(Contraints.RoleRecruiter)).GetAwaiter().GetResult();
        //            roleManager.CreateAsync(new IdentityRole<int>(Contraints.RoleCandidate)).GetAwaiter().GetResult();
        //            roleManager.CreateAsync(new IdentityRole<int>(Contraints.RoleStaff)).GetAwaiter().GetResult();
        //        }
        //        var identityUser = userManager.CreateAsync(new ApplicationUser
        //        {
        //            UserName = "admin123@gmail.com",
        //            Email = "admin123@gmail.com",
        //            FullName = "Admin",
        //            PhoneNumber = "0123456789",
        //            EmailConfirmed = true,
        //            IsActive = true,
        //            AccessFailedCount = 0
        //        }, "Admin123@").GetAwaiter().GetResult();
        //        if (identityUser.Succeeded)
        //        {
        //            var user = appContext.Users.FirstOrDefault(u => u.Email == "admin123@gmail.com");
        //            if (user != null)
        //            {
        //                userManager.AddToRoleAsync(user, Contraints.RoleAdmin).GetAwaiter().GetResult();
        //            }
        //        }
        //    }
        //}
    }
}
