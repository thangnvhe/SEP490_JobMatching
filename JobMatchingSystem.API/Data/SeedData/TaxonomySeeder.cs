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
            var taxonomyId = 1;

            // =========================
            // 🔹 Root Technologies (Level 0)
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
                    Id = taxonomyId++,
                    Name = tech,
                    ParentId = null
                };
                taxonomies.Add(taxonomy);
                rootTaxonomies[tech] = taxonomy;
            }

            // =========================
            // 🔹 Categories (Level 1)
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
                var parentId = rootTaxonomies[rootName].Id;
                
                foreach (var catName in cats)
                {
                    var taxonomy = new Taxonomy
                    {
                        Id = taxonomyId++,
                        Name = catName,
                        ParentId = parentId
                    };
                    taxonomies.Add(taxonomy);
                    categoryTaxonomies[$"{rootName}:{catName}"] = taxonomy;
                }
            }

            // =========================
            // 🔹 Subcategories (Level 2)
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
                            Id = taxonomyId++,
                            Name = subcatName,
                            ParentId = parentCategory.Id
                        };
                        taxonomies.Add(taxonomy);
                        subcategoryTaxonomies[$"{categoryKey}:{subcatName}"] = taxonomy;
                    }
                }
            }

            // =========================
            // 🔹 Specific Skills (Level 3)
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

            foreach (var (subcategoryKey, skillList) in skills)
            {
                // Try to find parent in subcategories first, then categories
                Taxonomy? parentTaxonomy = null;
                
                if (subcategoryTaxonomies.TryGetValue(subcategoryKey, out parentTaxonomy) ||
                    categoryTaxonomies.TryGetValue(subcategoryKey, out parentTaxonomy))
                {
                    foreach (var skillName in skillList)
                    {
                        var taxonomy = new Taxonomy
                        {
                            Id = taxonomyId++,
                            Name = skillName,
                            ParentId = parentTaxonomy.Id
                        };
                        taxonomies.Add(taxonomy);
                    }
                }
            }

            await context.Taxonomies.AddRangeAsync(taxonomies);
            await context.SaveChangesAsync();

            Console.WriteLine($"✅ Seeded {taxonomies.Count} skills in hierarchical structure!");
            var rootCount = rootTechnologies.Length;
            var categoryCount = categories.SelectMany(c => c.Value).Count();
            var subcategoryCount = subcategories.SelectMany(c => c.Value).Count();
            var skillCount = skills.SelectMany(s => s.Value).Count();
            
            Console.WriteLine($"  - Root Technologies: {rootCount}");
            Console.WriteLine($"  - Categories: {categoryCount}");
            Console.WriteLine($"  - Subcategories: {subcategoryCount}");
            Console.WriteLine($"  - Skills: {skillCount}");
        }
    }
}
