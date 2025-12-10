using JobMatchingSystem.API.Models;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Data.SeedData
{
    public static class PositionSeeder
    {
        public static async Task SeedPositionsAsync(this WebApplication app)
        {
            using var scope = app.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            if (await db.Positions.AnyAsync())
            {
                Console.WriteLine("ℹ️ Positions already seeded.");
                return;
            }

            var itPositions = new List<Position>
            {
                // Software Development
                new Position { Name = "Backend Developer" },
                new Position { Name = "Frontend Developer" },
                new Position { Name = "Fullstack Developer" },
                new Position { Name = "Mobile Developer" },
                new Position { Name = "iOS Developer" },
                new Position { Name = "Android Developer" },
                new Position { Name = "Flutter Developer" },
                new Position { Name = "React Native Developer" },
                new Position { Name = "Game Developer" },
                new Position { Name = "Unity Developer" },
                new Position { Name = "Unreal Developer" },

                // Web/App Development Specializations
                new Position { Name = "DevOps Engineer" },
                new Position { Name = "Cloud Engineer" },
                new Position { Name = "Site Reliability Engineer (SRE)" },

                // Data
                new Position { Name = "Data Engineer" },
                new Position { Name = "Data Analyst" },
                new Position { Name = "Data Scientist" },
                new Position { Name = "Machine Learning Engineer" },
                new Position { Name = "AI Engineer" },
                new Position { Name = "Deep Learning Engineer" },

                // Cybersecurity
                new Position { Name = "Security Engineer" },
                new Position { Name = "Information Security Analyst" },
                new Position { Name = "Penetration Tester" },
                new Position { Name = "Security Operations Center (SOC) Analyst" },

                // Testing / QA
                new Position { Name = "QA Engineer" },
                new Position { Name = "Manual Tester" },
                new Position { Name = "Automation Tester" },
                new Position { Name = "Test Lead" },

                // System / Network
                new Position { Name = "System Administrator" },
                new Position { Name = "Network Administrator" },
                new Position { Name = "Infrastructure Engineer" },

                // Architecture
                new Position { Name = "Solution Architect" },
                new Position { Name = "Software Architect" },

                // Project / Product
                new Position { Name = "Product Manager" },
                new Position { Name = "Product Owner" },
                new Position { Name = "Project Manager" },
                new Position { Name = "Scrum Master" },
                new Position { Name = "Business Analyst" },

                // UI/UX / Design
                new Position { Name = "UI/UX Designer" },
                new Position { Name = "UI Designer" },
                new Position { Name = "UX Researcher" },

                // Support
                new Position { Name = "IT Support" },
                new Position { Name = "Technical Support Engineer" },
                new Position { Name = "Helpdesk" },

                // Database
                new Position { Name = "Database Administrator" },
                new Position { Name = "DBA Engineer" },

                // Embedded / Hardware
                new Position { Name = "Embedded Engineer" },
                new Position { Name = "Firmware Engineer" },
                new Position { Name = "IoT Engineer" },

                // Others
                new Position { Name = "RPA Developer" },
                new Position { Name = "Blockchain Developer" },
                new Position { Name = "ERP Consultant" },
                new Position { Name = "SAP Consultant" },
                new Position { Name = "Technical Writer" }
            };

            await db.Positions.AddRangeAsync(itPositions);
            await db.SaveChangesAsync();

            Console.WriteLine($"✅ Seeded {itPositions.Count} IT positions.");
        }
    }
}
