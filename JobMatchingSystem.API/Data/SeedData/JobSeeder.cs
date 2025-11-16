using JobMatchingSystem.API.Enums;
using JobMatchingSystem.API.Models;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;

namespace JobMatchingSystem.API.Data.SeedData
{
    public static class JobSeeder
    {
        public static async Task SeedJobAsync(this WebApplication webApplication)
        {
            using var scope = webApplication.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            if (await db.Jobs.AnyAsync())
            {
                Console.WriteLine("⚠️ Jobs table already has data, skipping seed...");
                return;
            }

            var userIds = await db.Users
                .Where(u => u.Email != "admin123@gmail.com")
                .Select(u => u.Id)
                .ToListAsync();

            if (!userIds.Any())
            {
                Console.WriteLine("⚠️ Không có user nào trong hệ thống — không thể seed Jobs!");
                return;
            }

            string filePath = Path.Combine(
                webApplication.Environment.ContentRootPath,
                "Data", "SeedData", "Excels", "jobs.xlsx"
            );

            if (!File.Exists(filePath))
            {
                Console.WriteLine($"❌ Không tìm thấy file Excel: {filePath}");
                return;
            }

            ExcelPackage.License.SetNonCommercialPersonal("Nguyen Van Thang");
            using var package = new ExcelPackage(new FileInfo(filePath));
            var worksheet = package.Workbook.Worksheets[0];
            int rowCount = worksheet.Dimension.Rows;

            var jobs = new List<Job>();
            var rand = new Random();

            // 🔥 Danh sách JobType string
            string[] jobTypeList = { "Parttime", "Fulltime", "Remote" };

            for (int row = 2; row <= rowCount; row++)
            {
                var minSalary = rand.Next(5, 20) * 1_000_000;
                var maxSalary = rand.Next(20, 70) * 1_000_000;

                int companyId = rand.Next(1, 71);
                var posterId = userIds[rand.Next(userIds.Count)];

                var job = new Job
                {
                    Title = worksheet.Cells[row, 3].Text,
                    Description = worksheet.Cells[row, 1].Text,
                    Benefits = worksheet.Cells[row, 2].Text,
                    Location = worksheet.Cells[row, 4].Text,
                    Requirements = worksheet.Cells[row, 7].Text,
                    RecuiterId = posterId,
                    SalaryMin = minSalary,
                    SalaryMax = maxSalary,
                    CompanyId = companyId,

                    // ⭐ JobType random string
                    JobType = jobTypeList[rand.Next(jobTypeList.Length)],

                    // ⭐ Random số năm kinh nghiệm 1–10
                    ExperienceYear = rand.Next(1, 11),

                    Status = JobStatus.Draft,
                    CreatedAt = DateTime.Now,
                    OpenedAt = DateTime.Now,
                    ExpiredAt = DateTime.Now.AddMonths(1),
                    VerifiedBy = 1
                };
                // Thêm taxnomies for mỗi job
                var taxonomyCount = rand.Next(1, 4); // mỗi job có 1-3 taxonomies
                for (int i = 0; i < taxonomyCount; i++)
                {
                    var jobTaxonomy = new JobTaxonomy
                    {
                        TaxonomyId = rand.Next(1, 80), // giả sử có 80 taxonomy trong DB
                        JobId = job.JobId
                    };
                    job.JobTaxonomies.Add(jobTaxonomy);
                }
                    jobs.Add(job);
            }

            await db.Jobs.AddRangeAsync(jobs);
            await db.SaveChangesAsync();

            Console.WriteLine($"✅ Seeded {jobs.Count} jobs from Excel successfully!");
        }
    }
}
