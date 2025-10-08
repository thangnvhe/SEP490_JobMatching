using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using JobMatchingSystem.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace JobMatchingSystem.DataAccess.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole<int>, int>
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
        public DbSet<ApplyJob> ApplyJobs { get; set; }
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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ApplicationUser
            modelBuilder.Entity<ApplicationUser>(entity =>
            {
                // No Role/Status property on ApplicationUser to configure here.
            });

            // CandidateProfile
            modelBuilder.Entity<CandidateProfile>(entity =>
            {
                entity.HasIndex(e => e.UserId).IsUnique();
                entity.Property(e => e.JobType).HasConversion<string>();
                entity.HasOne(e => e.User)
                      .WithOne(e => e.CandidateProfile)
                      .HasForeignKey<CandidateProfile>(e => e.UserId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            // Company
            modelBuilder.Entity<Company>(entity =>
            {
                entity.Property(e => e.Status).HasConversion<string>();
                entity.HasOne(e => e.VerifiedByUser)
                      .WithMany(e => e.VerifiedCompanies)
                      .HasForeignKey(e => e.VerifiedBy)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            // CompanyRecruiter
            modelBuilder.Entity<CompanyRecruiter>(entity =>
            {
                entity.HasIndex(e => new { e.CompanyId, e.UserId }).IsUnique();
                entity.HasOne(e => e.Company)
                      .WithMany(e => e.CompanyRecruiters)
                      .HasForeignKey(e => e.CompanyId)
                      .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.User)
                      .WithMany(e => e.CompanyRecruiters)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            // Job
            modelBuilder.Entity<Job>(entity =>
            {
                entity.Property(e => e.JobType).HasConversion<string>();
                entity.Property(e => e.Status).HasConversion<string>();
                entity.HasOne(e => e.Company)
                      .WithMany(e => e.Jobs)
                      .HasForeignKey(e => e.CompanyId)
                      .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.Recruiter)
                      .WithMany(e => e.CreatedJobs)
                      .HasForeignKey(e => e.RecruiterId)
                      .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.Staff)
                      .WithMany(e => e.StaffJobs)
                      .HasForeignKey(e => e.StaffId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            // ApplyJob
            modelBuilder.Entity<ApplyJob>(entity =>
            {
                entity.Property(e => e.Status).HasConversion<string>();
                entity.HasOne(e => e.User)
                      .WithMany(e => e.ApplyJobs)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.Job)
                      .WithMany(e => e.ApplyJobs)
                      .HasForeignKey(e => e.JobId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            // SavedJob
            modelBuilder.Entity<SavedJob>(entity =>
            {
                entity.HasIndex(e => new { e.UserId, e.JobId }).IsUnique();
                entity.HasOne(e => e.User)
                      .WithMany(e => e.SavedJobs)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.Job)
                      .WithMany(e => e.SavedJobs)
                      .HasForeignKey(e => e.JobId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            // SavedCV
            modelBuilder.Entity<SavedCV>(entity =>
            {
                entity.HasOne(e => e.Recruiter)
                      .WithMany(e => e.SavedCVs)
                      .HasForeignKey(e => e.RecruiterId)
                      .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.Profile)
                      .WithMany(e => e.SavedCVs)
                      .HasForeignKey(e => e.ProfileId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            // DataCV
            modelBuilder.Entity<DataCV>(entity =>
            {
                entity.HasOne(e => e.User)
                      .WithMany(e => e.DataCVs)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            // EntityTaxonomy
            modelBuilder.Entity<EntityTaxonomy>(entity =>
            {
                entity.Property(e => e.EntityType).HasConversion<string>();
                entity.HasOne(e => e.Taxonomy)
                      .WithMany(e => e.EntityTaxonomies)
                      .HasForeignKey(e => e.TaxonomyId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            // Configure CV entities
            ConfigureCVEntities(modelBuilder);
            // Configure Report entity
            ConfigureReportEntity(modelBuilder);
        }

        private void ConfigureCVEntities(ModelBuilder builder)
        {
            builder.Entity<CVExperience>(entity =>
            {
                entity.HasOne(e => e.DataCV)
                      .WithMany(e => e.CVExperiences)
                      .HasForeignKey(e => e.CVId)
                      .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.userId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            builder.Entity<CVEducation>(entity =>
            {
                entity.HasOne(e => e.DataCV)
                      .WithMany(e => e.CVEducations)
                      .HasForeignKey(e => e.CVId)
                      .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.userId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            builder.Entity<CVProject>(entity =>
            {
                entity.HasOne(e => e.DataCV)
                      .WithMany(e => e.CVProjects)
                      .HasForeignKey(e => e.CVId)
                      .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.userId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            builder.Entity<CVCertificate>(entity =>
            {
                entity.HasOne(e => e.DataCV)
                      .WithMany(e => e.CVCertificates)
                      .HasForeignKey(e => e.CVId)
                      .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.userId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            builder.Entity<CVAchievement>(entity =>
            {
                entity.HasOne(e => e.DataCV)
                      .WithMany(e => e.CVAchievements)
                      .HasForeignKey(e => e.CVId)
                      .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.userId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            builder.Entity<CVSkill>(entity =>
            {
                entity.HasOne(e => e.DataCV)
                      .WithMany(e => e.CVSkills)
                      .HasForeignKey(e => e.CVId)
                      .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.userId)
                      .OnDelete(DeleteBehavior.NoAction);
            });
        }
        private void ConfigureReportEntity(ModelBuilder builder)
        {
            builder.Entity<Report>(entity =>
            {
                entity.HasOne(e => e.Job)
                      .WithMany(e => e.Reports)
                      .HasForeignKey(e => e.JobId)
                      .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.Reporter)
                      .WithMany(e => e.Reports)
                      .HasForeignKey(e => e.ReporterId)
                      .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.ReviewedBy)
                      .WithMany(e => e.ReviewedReports)
                      .HasForeignKey(e => e.ReviewedById)
                      .OnDelete(DeleteBehavior.NoAction);
            });
        }
    }
}
