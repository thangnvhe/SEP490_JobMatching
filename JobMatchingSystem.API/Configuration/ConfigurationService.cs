using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Entities;
using JobMatchingSystem.API.Helpers;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Configuration
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
        public static void ConfigureIdentity(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(connectionString));

            services.AddIdentity<ApplicationUser, IdentityRole<int>>()
                   .AddEntityFrameworkStores<ApplicationDbContext>()
                   .AddDefaultTokenProviders();
        }
    }
}
