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

            // =========================
            // 🔹 Level 0: Root Technologies (ParentId = null)
            // =========================
            var rootTechnologies = new[]
            {
                "Java", ".NET", "Python", "JavaScript/TypeScript", "PHP", "Go", "Ruby", "C/C++",
                "Mobile Development", "Database", "Cloud & DevOps", "AI & Data Science", "Cybersecurity"
            };

            var rootTaxonomies = new Dictionary<string, Taxonomy>();
            
            foreach (var tech in rootTechnologies)
            {
                var taxonomy = new Taxonomy
                {
                    Name = tech,
                    ParentId = null
                };
                await context.Taxonomies.AddAsync(taxonomy);
                rootTaxonomies[tech] = taxonomy;
            }
            await context.SaveChangesAsync(); // Save để có Id cho root taxonomies

            // =========================
            // 🔹 Level 1: Categories (ParentId = Root Id)
            // =========================
            var categories = new Dictionary<string, List<string>>
            {
                ["Java"] = new() { "Backend Framework", "Build Tools", "Testing" },
                [".NET"] = new() { "Framework", "ORM", "Testing" },
                ["Python"] = new() { "Web Framework", "Data Science", "Machine Learning" },
                ["JavaScript/TypeScript"] = new() { "Frontend Framework", "Backend Runtime", "Build Tools" },
                ["Mobile Development"] = new() { "Native Android", "Native iOS", "Cross-platform" },
                ["Database"] = new() { "Relational", "NoSQL", "In-memory" },
                ["Cloud & DevOps"] = new() { "Cloud Platforms", "Containerization", "CI/CD" }
            };

            var categoryTaxonomies = new Dictionary<string, Taxonomy>();
            
            foreach (var (rootName, cats) in categories)
            {
                var parent = rootTaxonomies[rootName];
                
                foreach (var catName in cats)
                {
                    var taxonomy = new Taxonomy
                    {
                        Name = catName,
                        ParentId = parent.Id
                    };
                    await context.Taxonomies.AddAsync(taxonomy);
                    categoryTaxonomies[$"{rootName}:{catName}"] = taxonomy;
                }
            }
            await context.SaveChangesAsync(); // Save để có Id cho categories

            // =========================
            // 🔹 Level 2: Subcategories (ParentId = Category Id)
            // =========================
            var subcategories = new Dictionary<string, List<string>>
            {
                ["Java:Backend Framework"] = new() { "Spring Ecosystem", "Jakarta EE" },
                [".NET:Framework"] = new() { "ASP.NET Core", "Desktop" },
                ["JavaScript/TypeScript:Frontend Framework"] = new() { "React Ecosystem", "Vue Ecosystem", "Angular" },
                ["Mobile Development:Cross-platform"] = new() { "Flutter", "React Native" }
            };

            var subcategoryTaxonomies = new Dictionary<string, Taxonomy>();
            
            foreach (var (categoryKey, subcats) in subcategories)
            {
                if (categoryTaxonomies.TryGetValue(categoryKey, out var parentCategory))
                {
                    foreach (var subcatName in subcats)
                    {
                        var taxonomy = new Taxonomy
                        {
                            Name = subcatName,
                            ParentId = parentCategory.Id
                        };
                        await context.Taxonomies.AddAsync(taxonomy);
                        subcategoryTaxonomies[$"{categoryKey}:{subcatName}"] = taxonomy;
                    }
                }
            }
            await context.SaveChangesAsync(); // Save để có Id cho subcategories

            // =========================
            // 🔹 Level 3: Specific Skills (ParentId = Subcategory Id hoặc Category Id)
            // =========================
            var skills = new Dictionary<string, List<string>>
            {
                ["Java:Backend Framework:Spring Ecosystem"] = new()
                {
                    "Spring Boot", "Spring Security", "Spring Data JPA", "Spring Cloud", "Spring WebFlux"
                },
                [".NET:Framework:ASP.NET Core"] = new()
                {
                    "ASP.NET Core MVC", "ASP.NET Core Web API", "Blazor", "SignalR"
                },
                [".NET:ORM"] = new()
                {
                    "Entity Framework Core", "Dapper", "NHibernate"
                },
                ["JavaScript/TypeScript:Frontend Framework:React Ecosystem"] = new()
                {
                    "React", "Next.js", "Redux", "React Router", "React Hook Form"
                },
                ["JavaScript/TypeScript:Frontend Framework:Vue Ecosystem"] = new()
                {
                    "Vue.js", "Nuxt.js", "Vuex", "Vue Router"
                },
                ["JavaScript/TypeScript:Backend Runtime"] = new()
                {
                    "Node.js", "Express.js", "Fastify", "NestJS"
                },
                ["Python:Web Framework"] = new()
                {
                    "Django", "Flask", "FastAPI", "Tornado"
                },
                ["Python:Data Science"] = new()
                {
                    "Pandas", "NumPy", "Matplotlib", "Seaborn"
                },
                ["Python:Machine Learning"] = new()
                {
                    "TensorFlow", "PyTorch", "Scikit-learn", "Keras"
                },
                ["Mobile Development:Native Android"] = new()
                {
                    "Kotlin", "Java (Android)", "Android Studio", "Jetpack Compose"
                },
                ["Mobile Development:Native iOS"] = new()
                {
                    "Swift", "Objective-C", "Xcode", "SwiftUI"
                },
                ["Database:Relational"] = new()
                {
                    "SQL Server", "MySQL", "PostgreSQL", "Oracle", "SQLite"
                },
                ["Database:NoSQL"] = new()
                {
                    "MongoDB", "Cassandra", "DynamoDB", "CouchDB"
                },
                ["Database:In-memory"] = new()
                {
                    "Redis", "Memcached", "Apache Ignite"
                },
                ["Cloud & DevOps:Cloud Platforms"] = new()
                {
                    "AWS", "Azure", "Google Cloud Platform", "DigitalOcean"
                },
                ["Cloud & DevOps:Containerization"] = new()
                {
                    "Docker", "Kubernetes", "Docker Compose"
                },
                ["Cloud & DevOps:CI/CD"] = new()
                {
                    "Jenkins", "GitHub Actions", "GitLab CI", "Azure DevOps"
                }
            };

            var skillCount = 0;
            foreach (var (subcategoryKey, skillList) in skills)
            {
                // Tìm parent trong subcategories trước, sau đó trong categories
                Taxonomy? parentTaxonomy = null;
                
                if (subcategoryTaxonomies.TryGetValue(subcategoryKey, out parentTaxonomy) ||
                    categoryTaxonomies.TryGetValue(subcategoryKey, out parentTaxonomy))
                {
                    foreach (var skillName in skillList)
                    {
                        var taxonomy = new Taxonomy
                        {
                            Name = skillName,
                            ParentId = parentTaxonomy.Id
                        };
                        await context.Taxonomies.AddAsync(taxonomy);
                        skillCount++;
                    }
                }
            }
            await context.SaveChangesAsync(); // Save skills

            // =========================
            // 🔹 Summary
            // =========================
            var totalCount = context.Taxonomies.Count();
            Console.WriteLine($"✅ Seeded {totalCount} taxonomies in hierarchical structure!");
            Console.WriteLine($"  - Root Technologies (Level 0): {rootTechnologies.Length}");
            Console.WriteLine($"  - Categories (Level 1): {categories.SelectMany(c => c.Value).Count()}");
            Console.WriteLine($"  - Subcategories (Level 2): {subcategories.SelectMany(c => c.Value).Count()}");
            Console.WriteLine($"  - Skills (Level 3): {skillCount}");
        }
    }
}
