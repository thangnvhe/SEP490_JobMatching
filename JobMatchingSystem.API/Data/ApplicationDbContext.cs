using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using JobMatchingSystem.API.Entities;
using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, int>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // DbSets for all entities
        public DbSet<ApplicationUser> ApplicationUsers { get; set; }
        public DbSet<CandidateProfile> CandidateProfiles { get; set; }
        public DbSet<Company> Companies { get; set; }
        public DbSet<CompanyRecruiter> CompanyRecruiters { get; set; }
        public DbSet<Job> Jobs { get; set; }
        public DbSet<CandidateJob> CandidateJobs { get; set; }
        public DbSet<SavedJob> SavedJobs { get; set; }
        public DbSet<SavedCV> SavedCVs { get; set; }
        public DbSet<DataCV> DataCVs { get; set; }
        public DbSet<CVExperience> CVExperiences { get; set; }
        public DbSet<CVEducation> CVEducations { get; set; }
        public DbSet<CVProject> CVProjects { get; set; }
        public DbSet<CVCertificate> CVCertificates { get; set; }
        public DbSet<CVAchievement> CVAchievements { get; set; }
        public DbSet<CVSkill> CVSkills { get; set; }
        public DbSet<Taxonomy> Taxonomies { get; set; }
        public DbSet<EntityTaxonomy> EntityTaxonomies { get; set; }
        public DbSet<Report> Reports { get; set; }
        public DbSet<Feedback> Feedbacks { get; set; }
        public DbSet<TemplateCV> TemplateCVs { get; set; }
        public DbSet<Offer> Offers { get; set; }
        public DbSet<ReportSolved> ReportSolveds { get; set; }
        public DbSet<JobStage> JobStages { get; set; }
        public DbSet<CandidateStage> CandidateStages { get; set; }
        public DbSet<Code> Codes { get; set; }
        public DbSet<CodeTestCase> CodeTestCases { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            builder.Entity<ApplicationUser>()
                .HasOne(u => u.Role)
                .WithMany(r => r.Users)
                .HasForeignKey(u => u.RoleId)
                .IsRequired();
        }

    }
}

