using JobMatchingSystem.API.Entities;
using JobMatchingSystem.API.Helpers;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using System.Globalization;
using System.Text;

namespace JobMatchingSystem.API.Data.SeedData
{
    public static class CandidateSeeder
    {
        public static async Task SeedCandidatesAsync(this WebApplication webApplication, int count = 10)
        {
            using var scope = webApplication.Services.CreateScope();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<int>>>();
            var appContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // đảm bảo role candidate tồn tại
            if (!await roleManager.RoleExistsAsync(Contraints.RoleCandidate))
                await roleManager.CreateAsync(new IdentityRole<int>(Contraints.RoleCandidate));

            var familyName = "Nguyễn";
            var middleNames = new[] { "Văn", "Thị", "Minh", "Ngọc", "Hữu", "Bảo", "Quang", "Thu", "Đức", "Trọng" };
            var givenNames = new[]
            {
            "An","Bình","Chi","Dũng","Hà","Hạnh","Hiếu","Hoa","Hùng","Khánh",
            "Lan","Linh","Minh","Nam","Phúc","Quang","Sơn","Thảo","Thúy","Trang",
            "Tuấn","Tùng","Vy","Yến","Khang","Trung","Tâm","Thanh","Phương","Nhật"
        };

            var rnd = new Random();

            // helper: remove dấu cho email
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
                var middle = middleNames[rnd.Next(middleNames.Length)];
                var given = givenNames[rnd.Next(givenNames.Length)];
                var fullName = $"{familyName} {middle} {given}";

                // email không dấu, thêm 123 + index
                var local = RemoveDiacritics($"{familyName}{middle}{given}")
                    .Replace(" ", "")
                    .ToLowerInvariant();
                var email = $"{local}123{i + 1}@gmail.com";

                // nếu có user trùng email thì bỏ qua
                if (await userManager.FindByEmailAsync(email) != null)
                    continue;

                var candidate = new ApplicationUser
                {
                    UserName = email,
                    Email = email,
                    FullName = fullName,
                    PhoneNumber = $"09{rnd.Next(10000000, 99999999)}",
                    AvatarUrl = null,
                    Gender = rnd.Next(0, 2) == 0, // random true/false
                    Birthday = DateTime.UtcNow.AddYears(-rnd.Next(20, 35)).AddDays(-rnd.Next(0, 365)),
                    Score = rnd.Next(0, 300),
                    IsActive = true,
                    AccessFailedCount = 0,
                    EmailConfirmed = true
                };

                var createResult = await userManager.CreateAsync(candidate, "Candidate123@");
                if (createResult.Succeeded)
                {
                    await userManager.AddToRoleAsync(candidate, Contraints.RoleCandidate);
                    Console.WriteLine($"✅ Seeded candidate: {email} ({fullName})");
                }
                else
                {
                    var errs = string.Join("; ", createResult.Errors.Select(e => e.Description));
                    Console.WriteLine($"❌ Seed candidate {email} failed: {errs}");
                }
            }
        }
    }
}
