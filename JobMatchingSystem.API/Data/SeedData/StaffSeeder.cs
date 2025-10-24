using JobMatchingSystem.API.Entities;
using JobMatchingSystem.API.Helpers;
using Microsoft.AspNetCore.Identity;
using System.Globalization;
using System.Text;

namespace JobMatchingSystem.API.Data.SeedData
{
    public static class StaffSeeder
    {
        public static async Task SeedStaffsAsync(this WebApplication webApplication, int count = 20)
        {
            using var scope = webApplication.Services.CreateScope();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<int>>>();
            var appContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // ✅ Kiểm tra nếu đã có staff, thì bỏ qua
            if (await userManager.GetUsersInRoleAsync(Contraints.RoleStaff) is { Count: > 0 })
            {
                Console.WriteLine(" Staff data already exists, skipping seed...");
                return;
            }

            // ✅ Đảm bảo role Staff tồn tại
            if (!await roleManager.RoleExistsAsync(Contraints.RoleStaff))
                await roleManager.CreateAsync(new IdentityRole<int>(Contraints.RoleStaff));

            var familyName = "Trần";
            var middleNames = new[] { "Văn", "Thị", "Minh", "Ngọc", "Bảo", "Quang", "Thu", "Đức", "Hoài", "Hữu" };
            var givenNames = new[]
            {
                "Huyền","Dũng","An","Linh","Trang","Phương","Tâm","Tuấn","Khang","Vy",
                "Trung","Khánh","Nam","Hạnh","Phong","Trúc","Bích","Sơn","Phúc","Yến"
            };

            var rnd = new Random();

            static string RemoveDiacritics(string s)
            {
                var normalized = s.Normalize(NormalizationForm.FormD);
                var sb = new StringBuilder();
                foreach (var ch in normalized)
                {
                    var uc = CharUnicodeInfo.GetUnicodeCategory(ch);
                    if (uc != UnicodeCategory.NonSpacingMark)
                        sb.Append(ch);
                }
                return sb.ToString().Normalize(NormalizationForm.FormC);
            }

            for (int i = 0; i < count; i++)
            {
                var middle = middleNames[i % middleNames.Length];
                var given = givenNames[i % givenNames.Length];

                var fullName = $"{familyName} {middle} {given}";

                var local = RemoveDiacritics($"{familyName}{middle}{given}")
                                .Replace(" ", "")
                                .ToLowerInvariant();

                var email = $"{local}staff{i + 1}@gmail.com";

                var existing = await userManager.FindByEmailAsync(email);
                if (existing != null)
                    continue;

                var staffUser = new ApplicationUser
                {
                    UserName = email,
                    Email = email,
                    FullName = fullName,
                    PhoneNumber = $"09{rnd.Next(10000000, 99999999)}",
                    AvatarUrl = null,
                    Gender = (i % 2 == 0),
                    Birthday = DateTime.UtcNow.AddYears(-rnd.Next(22, 40)).AddDays(-rnd.Next(0, 365)),
                    Score = rnd.Next(100, 600),
                    IsActive = true,
                    AccessFailedCount = 0,
                    EmailConfirmed = true
                };

                var createResult = await userManager.CreateAsync(staffUser, "Staff123@");

                if (createResult.Succeeded)
                {
                    await userManager.AddToRoleAsync(staffUser, Contraints.RoleStaff);
                }
                else
                {
                    var errs = string.Join("; ", createResult.Errors.Select(e => e.Description));
                    Console.WriteLine($"Seed staff {email} failed: {errs}");
                }
            }
        }
    }
}

