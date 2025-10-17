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
        public DbSet<Interview> Interviews { get; set; }
        public DbSet<Offer> Offers { get; set; }
        public DbSet<ReportSolved> ReportSolveds { get; set; }
        public DbSet<Round> Rounds { get; set; }
        public DbSet<RoundResult> RoundResults { get; set; }
        public DbSet<Test> Tests { get; set; }
        public DbSet<TestQuestion> TestQuestions { get; set; }
        public DbSet<QuestionOption> QuestionOptions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ApplicationUser
            modelBuilder.Entity<ApplicationUser>(entity =>
            {
                entity.HasIndex(e => e.Email).IsUnique();
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
                entity.Property(e => e.Status).HasConversion<byte>().HasColumnType("tinyint");
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
                entity.Property(e => e.JobType).HasConversion<byte>().HasColumnType("tinyint");
                entity.Property(e => e.Status).HasConversion<byte>().HasColumnType("tinyint");
                entity.HasOne(e => e.Company)
                      .WithMany(e => e.Jobs)
                      .HasForeignKey(e => e.CompanyId)
                      .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.Recruiter)
                      .WithMany(e => e.CreatedJobs)
                      .HasForeignKey(e => e.Poster)
                      .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.Staff)
                      .WithMany(e => e.StaffJobs)
                      .HasForeignKey(e => e.VerifiedBy)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            // ApplyJob
            modelBuilder.Entity<ApplyJob>(entity =>
            {
                entity.Property(e => e.Status).HasConversion<byte>().HasColumnType("tinyint");
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
                entity.HasIndex(e => new { e.RecruiterId, e.CVId }).IsUnique();
                entity.HasOne(e => e.Recruiter)
                      .WithMany(e => e.SavedCVs)
                      .HasForeignKey(e => e.RecruiterId)
                      .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.CV)
                      .WithMany(e => e.SavedCVs)
                      .HasForeignKey(e => e.CVId)
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
                entity.Property(e => e.EntityType).HasConversion<byte>().HasColumnType("tinyint");
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
                      .WithMany(e=>e.CVExperiences)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            builder.Entity<CVEducation>(entity =>
            {
                entity.HasOne(e => e.DataCV)
                      .WithMany(e => e.CVEducations)
                      .HasForeignKey(e => e.CVId)
                      .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.User)
                      .WithMany(e=>e.CVEducations)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            builder.Entity<CVProject>(entity =>
            {
                entity.HasOne(e => e.DataCV)
                      .WithMany(e => e.CVProjects)
                      .HasForeignKey(e => e.CVId)
                      .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.User)
                      .WithMany(e=>e.CVProjects)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            builder.Entity<CVCertificate>(entity =>
            {
                entity.HasOne(e => e.DataCV)
                      .WithMany(e => e.CVCertificates)
                      .HasForeignKey(e => e.CVId)
                      .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.User)
                      .WithMany(e=>e.CVCertificates)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            builder.Entity<CVAchievement>(entity =>
            {
                entity.HasOne(e => e.DataCV)
                      .WithMany(e => e.CVAchievements)
                      .HasForeignKey(e => e.CVId)
                      .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.User)
                      .WithMany(e=>e.CVAchievements)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            builder.Entity<CVSkill>(entity =>
            {
                entity.HasOne(e => e.DataCV)
                      .WithMany(e => e.CVSkills)
                      .HasForeignKey(e => e.CVId)
                      .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.User)
                      .WithMany(e=>e.CVSkills)
                      .HasForeignKey(e => e.UserId)
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
            });
            builder.Entity<ReportSolved>(
                entity =>
                {
                    entity.HasOne(e => e.Report)
                          .WithOne(e => e.ReportSolved)
                          .HasForeignKey<ReportSolved>(e => e.ReportId)
                          .OnDelete(DeleteBehavior.NoAction);
                    entity.HasOne(e => e.User)
                            .WithMany(e => e.ReviewedReports)
                            .HasForeignKey(e => e.SolvedBy)
                            .OnDelete(DeleteBehavior.NoAction);
                });
            builder.Entity<Feedback>(entity => {
            });
            builder.Entity<Interview>(entity =>
            {
                entity.HasOne(e => e.Job)
                      .WithMany(e => e.Interviews)
                      .HasForeignKey(e => e.JobId)
                      .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.Candidate)
                        .WithMany(e => e.Interviews)
                        .HasForeignKey(e => e.CandidateId)
                        .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.Round)
                        .WithMany(e => e.Interviews)
                        .HasForeignKey(e => e.RoundId)
                        .OnDelete(DeleteBehavior.NoAction);
            });
            builder.Entity<Offer>(entity =>
            {
                entity.HasOne(e => e.Job)
                      .WithMany(e => e.Offers)
                      .HasForeignKey(e => e.JobId)
                      .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.Candidate)
                        .WithMany(e => e.Offers)
                        .HasForeignKey(e => e.CandidateId)
                        .OnDelete(DeleteBehavior.NoAction);
            });
            builder.Entity<Round>(entity =>
            {
                entity.HasOne(e => e.Job)
                     .WithMany(e => e.Rounds)
                     .HasForeignKey(e => e.JobId)
                     .OnDelete(DeleteBehavior.NoAction);
            });
            builder.Entity<RoundResult>(entity =>
            {
                entity.HasOne(e => e.Round)
                      .WithMany(e => e.RoundResults)
                      .HasForeignKey(e => e.RoundId)
                      .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.Candidate)
                        .WithMany(e => e.RoundResults)
                        .HasForeignKey(e => e.CandidateId)
                        .OnDelete(DeleteBehavior.NoAction);
            });
            builder.Entity<Test>(entity =>
            {
                entity.HasOne(e => e.Round)
                      .WithMany(e => e.Tests)
                      .HasForeignKey(e => e.RoundId)
                      .OnDelete(DeleteBehavior.NoAction);
            });
            builder.Entity<TestQuestion>(entity =>
            {
                entity.HasOne(e => e.Test)
                      .WithMany(e => e.TestQuestions)
                      .HasForeignKey(e => e.TestId)
                      .OnDelete(DeleteBehavior.NoAction);
            });
            builder.Entity<QuestionOption>(entity =>
            {
                entity.HasOne(e => e.TestQuestion)
                      .WithMany(e => e.QuestionOptions)
                      .HasForeignKey(e => e.QuestionId)
                      .OnDelete(DeleteBehavior.NoAction);
            });
        }
    }
}
