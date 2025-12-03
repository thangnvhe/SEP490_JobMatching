using JobMatchingSystem.API.Data;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.Tests.Helpers
{
    public static class TestDbContextFactory
    {
        public static ApplicationDbContext CreateInMemoryContext(string databaseName)
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: databaseName)
                .Options;

            var context = new ApplicationDbContext(options);
            return context;
        }

        public static void SeedTestData(ApplicationDbContext context)
        {
            // Add common test data here if needed
            context.SaveChanges();
        }

        public static void CleanupContext(ApplicationDbContext context)
        {
            context.Database.EnsureDeleted();
            context.Dispose();
        }
    }
}