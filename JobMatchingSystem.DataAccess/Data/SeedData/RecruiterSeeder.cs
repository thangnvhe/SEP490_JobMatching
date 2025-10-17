using JobMatchingSystem.Domain.Entities;
using JobMatchingSystem.Domain.Settings;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using System.Globalization;
using System.Text;

namespace JobMatchingSystem.DataAccess.Data.SeedData
{
    public static class RecruiterSeeder
    {
        public static async Task SeedRecruitersAsync(this WebApplication webApplication, int count = 50)
        {
            using var scope = webApplication.Services.CreateScope();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<int>>>();
            var appContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // đảm bảo role recruiter tồn tại
            if (!await roleManager.RoleExistsAsync(Contraints.RoleRecruiter))
                await roleManager.CreateAsync(new IdentityRole<int>(Contraints.RoleRecruiter));

            var familyName = "Nguyễn";
            var middleNames = new[] { "Văn", "Thị", "Minh", "Thùy", "Ngọc", "Hữu", "Bảo", "Quang", "Thu", "Đức" };
            var givenNames = new[]
            {
            "Thắng","Thúy","Minh","Huy","Lan","Hoa","Quỳnh","Dũng","An","Linh",
            "Trang","Phương","Tâm","Tuấn","Khang","Hà","Vy","Trung","Khánh","Nam",
            "Hạnh","Phong","Trúc","Bích","Sơn","Phúc","Hằng","Yến","Khôi","Bình",
            "Giang","Hoàng","Thao","Liên","Nhật","Tuyền","Khánh","Thanh","Cường","Đạt",
            "Nga","Hùng","Vũ","Tiến","Kiên","Ngân","Xuân","Như","Trọng","Dạ"
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
                // chọn middle và given
                var middle = middleNames[i % middleNames.Length];
                var given = givenNames[i % givenNames.Length];

                var fullName = $"{familyName} {middle} {given}";

                // tạo local-part email không dấu, không khoảng trắng, lowercase
                // thêm "123" và index để chắc chắn unique: e.g. nguyenvanthang1231@gmail.com
                var local = RemoveDiacritics($"{familyName}{middle}{given}")
                                .Replace(" ", "")
                                .ToLowerInvariant();
                var email = $"{local}123{i + 1}@gmail.com";

                // nếu có sẵn user với email, skip
                var existing = await userManager.FindByEmailAsync(email);
                if (existing != null)
                    continue;

                var recruiterUser = new ApplicationUser
                {
                    UserName = email,
                    Email = email,
                    FullName = fullName,
                    PhoneNumber = $"09{rnd.Next(10000000, 99999999)}",
                    AvatarUrl = null,
                    Gender = (givenNames.Take(i + 1).Last().Length % 2 == 0) ? (bool?)true : (bool?)false, // simple alternate
                    Birthday = DateTime.UtcNow.AddYears(-rnd.Next(25, 45)).AddDays(-rnd.Next(0, 365)),
                    Score = rnd.Next(0, 500),
                    IsActive = true,
                    AccessFailedCount = 0,
                    EmailConfirmed = true
                };

                var createResult = await userManager.CreateAsync(recruiterUser, "Recruiter123@");
                if (createResult.Succeeded)
                {
                    await userManager.AddToRoleAsync(recruiterUser, Contraints.RoleRecruiter);
                    // nếu bạn muốn lưu thêm thông tin vào db context khác, có thể làm ở đây
                }
                else
                {
                    // log lỗi (bạn có thể thay bằng logger)
                    var errs = string.Join("; ", createResult.Errors.Select(e => e.Description));
                    Console.WriteLine($"Seed recruiter {email} failed: {errs}");
                }
            }
        }
    }
}
