using JobMatchingSystem.API.Models;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Data.SeedData
{
    public static class ServicePlanSeeder
    {
        public static async Task SeedServicePlansAsync(this WebApplication app)
        {
            using var scope = app.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // Nếu bảng đã có dữ liệu thì bỏ qua
            if (await db.ServicePlans.AnyAsync())
            {
                Console.WriteLine("⚠️ ServicePlans already seeded.");
                return;
            }

            var plans = new List<ServicePlan>
            {
                new ServicePlan
                {
                    Name = "Basic Plan",
                    Description = "Nhà tuyển dụng có thêm 2 lượt tạo job vĩnh viễn",
                    Price = 2000
                },
                new ServicePlan
                {
                    Name = "AI Plan",
                    Description = "Tích hợp công nghệ AI hỗ trợ nhà tuyển dụng trong quá trình tuyển dụng",
                    Price = 3000
                }
            };

            await db.ServicePlans.AddRangeAsync(plans);
            await db.SaveChangesAsync();

            Console.WriteLine("✅ Seeded ServicePlans successfully.");
        }
    }
}
