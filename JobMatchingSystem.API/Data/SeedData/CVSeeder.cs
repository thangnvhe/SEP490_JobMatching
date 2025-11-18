using JobMatchingSystem.API.Models;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Data.SeedData
{
    public static class CVSeeder
    {
        public static async Task SeedCVUploadsAsync(this WebApplication webApplication)
        {
            using var scope = webApplication.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // Nếu đã có CV rồi thì bỏ qua
            if (await db.CVUploads.AnyAsync())
                return;

            var cvSeeds = new List<(int UserId, string FileName)>
    {
        (7, "cv_user7.pdf"),
        (8, "cv_user8.pdf"),
        (9, "cv_user9.pdf"),
    };

            foreach (var seed in cvSeeds)
            {
                // Kiểm tra nếu user chưa tồn tại có thể bỏ qua hoặc throw
                var userExists = await db.Users.AnyAsync(u => u.Id == seed.UserId);
                if (!userExists)
                {
                    Console.WriteLine($"❌ User {seed.UserId} không tồn tại, bỏ qua.");
                    continue;
                }

                // Kiểm tra nếu CV cho user này đã tồn tại thì bỏ qua
                if (await db.CVUploads.AnyAsync(c => c.UserId == seed.UserId))
                    continue;

                var cv = new CVUpload
                {
                    UserId = seed.UserId,
                    Name = $"CV của User {seed.UserId}",
                    FileName = seed.FileName,
                    FileUrl = $"/uploads/cv/{seed.FileName}",
                    IsPrimary = true,
                };

                await db.CVUploads.AddAsync(cv);
                Console.WriteLine($"📄 Seed CV cho user {seed.UserId}: {seed.FileName}");
            }

            await db.SaveChangesAsync();
        }
    }
}
