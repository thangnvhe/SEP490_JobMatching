using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Data.SeedData
{
    public static class TaxonomySeeder
    {
        public static async Task SeedTaxonomiesAsync(this WebApplication app)
        {
            using var scope = app.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            if (context.Taxonomies.Any()) return; // tránh seed trùng

            var taxonomies = new List<Taxonomy>();

            // =========================
            // 🔹 Frontend Skills
            // =========================
            var frontendSkills = new[]
            {
                "HTML", "CSS", "JavaScript", "TypeScript", "React", "Angular", "Vue.js",
                "Next.js", "Nuxt.js", "TailwindCSS", "Bootstrap", "SASS/SCSS", "Redux", "Webpack", "Vite"
            };

            // =========================
            // 🔹 Backend Skills
            // =========================
            var backendSkills = new[]
            {
                "C#", "ASP.NET Core", "Entity Framework", "Java", "Spring Boot", "Python",
                "Django", "Flask", "Node.js", "Express.js", "PHP", "Laravel", "Go", "Ruby on Rails",
                "REST API", "GraphQL", "gRPC", "Microservices", "Clean Architecture", "Design Patterns"
            };

            // =========================
            // 🔹 Database & Cloud
            // =========================
            var dataAndCloudSkills = new[]
            {
                "SQL Server", "MySQL", "PostgreSQL", "MongoDB", "Redis", "ElasticSearch",
                "Firebase", "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "CI/CD", "Git"
            };

            // =========================
            // 🔹 Mobile Development
            // =========================
            var mobileSkills = new[]
            {
                "Android", "Kotlin", "Java (Mobile)", "iOS", "Swift", "Flutter", "React Native", "Xamarin"
            };

            // =========================
            // 🔹 AI / Data
            // =========================
            var aiAndDataSkills = new[]
            {
                "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Pandas", "NumPy",
                "Data Analysis", "Data Visualization", "Big Data", "Natural Language Processing (NLP)"
            };

            // =========================
            // 🔹 DevOps & Security
            // =========================
            var devOpsAndSecuritySkills = new[]
            {
                "DevOps", "Linux", "Shell Script", "Ansible", "Terraform", "Jenkins",
                "Agile", "Scrum", "Network", "Cybersecurity", "Penetration Testing"
            };

            // =========================
            // 🔹 Soft Skills
            // =========================
            var softSkills = new[]
            {
                "Communication", "Teamwork", "Problem Solving", "Critical Thinking",
                "Time Management", "Leadership", "Adaptability", "Creativity"
            };

            // ✅ Gộp tất cả kỹ năng vào danh sách
            var allSkills = frontendSkills
                .Concat(backendSkills)
                .Concat(dataAndCloudSkills)
                .Concat(mobileSkills)
                .Concat(aiAndDataSkills)
                .Concat(devOpsAndSecuritySkills)
                .Concat(softSkills)
                .Distinct() // loại bỏ trùng lặp
                .Select(s => new Taxonomy { Name = s })
                .ToList();

            await context.Taxonomies.AddRangeAsync(allSkills);
            await context.SaveChangesAsync();

            Console.WriteLine($"✅ Seeded {allSkills.Count} skills successfully!");
        }
    }
}
