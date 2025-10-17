using JobMatchingSystem.Domain.Entities;
using JobMatchingSystem.Domain.Enums;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Builder;

namespace JobMatchingSystem.DataAccess.Data.SeedData
{
    public static class TaxonomySeeder
    {
        public static async Task SeedTaxonomiesAsync(this WebApplication app)
        {
            using var scope = app.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            if (context.Taxonomies.Any()) return; // tránh seed trùng

            var now = DateTime.UtcNow;

            // =========================
            // 🔹 Skill: Kỹ năng phổ biến trong ngành IT
            // =========================
            var skills = new[]
            {
            "C#", "ASP.NET Core", "Entity Framework", "SQL Server", "Java",
            "Spring Boot", "Python", "Django", "Flask", "JavaScript", "TypeScript",
            "React", "Angular", "Vue.js", "Node.js", "Express.js", "PHP", "Laravel",
            "HTML", "CSS", "Bootstrap", "TailwindCSS", "REST API", "GraphQL",
            "AWS", "Azure", "Docker", "Kubernetes", "Git", "CI/CD", "Agile",
            "Scrum", "Jira", "Unit Testing", "Microservices", "Clean Architecture",
            "OOP", "SOLID", "Design Patterns", "MongoDB", "PostgreSQL",
            "Redis", "ElasticSearch", "Machine Learning", "Deep Learning", "AI",
            "Mobile Development", "Android", "iOS", "Flutter", "React Native"
        };

            // =========================
            // 🔹 Category: Loại công việc / ngành nghề trong IT
            // =========================
            var categories = new[]
            {
            "Software Development",
            "Web Development",
            "Mobile Development",
            "Game Development",
            "AI / Machine Learning",
            "Data Engineer / Data Scientist",
            "DevOps / Cloud Engineer",
            "QA / QC / Tester",
            "System Administrator",
            "Network Engineer",
            "Project Manager / Scrum Master",
            "UI/UX Design",
            "Business Analyst",
            "Product Manager",
            "IT Support",
            "Cybersecurity",
            "Embedded Systems",
            "Blockchain Developer",
            "Automation Engineer",
            "Technical Leader / Architect"
        };

            var taxonomies = new List<Taxonomy>();

            taxonomies.AddRange(skills.Select(s => new Taxonomy
            {
                Type = TaxonomyType.Skill,
                Name = s,
                CreatedAt = now
            }));

            taxonomies.AddRange(categories.Select(c => new Taxonomy
            {
                Type = TaxonomyType.Category,
                Name = c,
                CreatedAt = now
            }));

            await context.Taxonomies.AddRangeAsync(taxonomies);
            await context.SaveChangesAsync();

            Console.WriteLine($"✅ Seeded {skills.Length} skills and {categories.Length} categories successfully!");
        }
    }
}
