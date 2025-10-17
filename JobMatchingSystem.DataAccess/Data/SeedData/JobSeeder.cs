using JobMatchingSystem.Domain.Entities;
using JobMatchingSystem.Domain.Enums;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using OfficeOpenXml;

namespace JobMatchingSystem.DataAccess.Data.SeedData
{
    public static class JobSeeder
    {
        public static async Task SeedJobAsync(this WebApplication webApplication)
        {
            using var scope = webApplication.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // Nếu đã có job rồi thì bỏ qua
            if (await db.Jobs.AnyAsync())
            {
                Console.WriteLine("⚠️ Jobs table already has data, skipping seed...");
                return;
            }
            // Lấy danh sách user có thể đăng job (loại bỏ admin)
            var userIds = await db.Users
                .Where(u => u.Email != "admin123@gmail.com") // 👈 hoặc Role != "Admin"
                .Select(u => u.Id)
                .ToListAsync();
            if (!userIds.Any())
            {
                Console.WriteLine("⚠️ Không có user nào trong hệ thống — không thể seed Jobs!");
                return;
            }


            // Đường dẫn file Excel trong thư mục dự án
            string filePath = Path.Combine(webApplication.Environment.WebRootPath, "seed", "jobs.xlsx");


            if (!File.Exists(filePath))
            {
                Console.WriteLine($"❌ Không tìm thấy file Excel: {filePath}");
                return;
            }

            // Nếu bạn không muốn dùng EPPlus có license, thì dùng ClosedXML hoặc MiniExcel (mình sẽ gợi ý bên dưới)
            ExcelPackage.License.SetNonCommercialPersonal("Nguyen Van Thang");

            using var package = new ExcelPackage(new FileInfo(filePath));
            var worksheet = package.Workbook.Worksheets[0];
            int rowCount = worksheet.Dimension.Rows;

            var jobs = new List<Job>();
            var rand = new Random();

            for (int row = 2; row <= rowCount; row++) // bỏ dòng tiêu đề
            {
                // random lương 5 - 70 triệu
                var minSalary = rand.Next(5, 20) * 1_000_000;   // 5 - 50 triệu
                var maxSalary = rand.Next(20, 70) * 1_000_000;  // 50 - 70 triệu

                // random công ty 1-70
                int companyId = rand.Next(1, 71);
                var posterId = userIds[rand.Next(userIds.Count)]; // ✅ lấy userId thật từ DB

                // random job type (enum)
                var jobTypes = Enum.GetValues(typeof(JobType));
                var randomJobType = (JobType)jobTypes.GetValue(rand.Next(jobTypes.Length))!;

                var job = new Job
                {
                    Title = worksheet.Cells[row, 3].Text,
                    Description = worksheet.Cells[row, 1].Text,
                    Benefits = worksheet.Cells[row, 2].Text,
                    Location = worksheet.Cells[row, 4].Text,
                    WorkInfo = worksheet.Cells[row, 6].Text,
                    Requirements = worksheet.Cells[row, 7].Text,
                    Poster = posterId,
                    SalaryMin = minSalary,
                    SalaryMax = maxSalary,
                    CompanyId = companyId,
                    JobType = randomJobType,
                    Status = JobStatus.Pending,
                    CreatedAt = DateTime.Now,
                };

                jobs.Add(job);
            }

            await db.Jobs.AddRangeAsync(jobs);
            await db.SaveChangesAsync();

            Console.WriteLine($"✅ Seeded {jobs.Count} jobs from Excel successfully!");
        }
    }
}
