using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using JobMatchingSystem.API.Entities;

namespace JobMatchingSystem.API.Data
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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ApplicationUser - dùng normalized fields để đảm bảo uniqueness đúng chuẩn Identity
            modelBuilder.Entity<ApplicationUser>(entity =>
            {
                entity.HasIndex(e => e.NormalizedUserName).IsUnique();
                entity.HasIndex(e => e.NormalizedEmail).IsUnique();
                // Nếu bạn đã có HasIndex(e => e.Email).IsUnique(), nên bỏ để tránh trùng lặp chỉ số
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

            // Identity junctions: chặn cascade delete để không tự động xóa UserRoles khi xóa Users/Roles
            modelBuilder.Entity<IdentityUserRole<int>>(entity =>
            {
                entity.HasKey(ur => new { ur.UserId, ur.RoleId });

                entity.HasOne<ApplicationUser>()
                      .WithMany()
                      .HasForeignKey(ur => ur.UserId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne<IdentityRole<int>>()
                      .WithMany()
                      .HasForeignKey(ur => ur.RoleId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Khuyến nghị: cũng Restrict cho các bảng Identity khác để đồng nhất hành vi
            modelBuilder.Entity<IdentityUserLogin<int>>(entity =>
            {
                entity.HasKey(l => new { l.LoginProvider, l.ProviderKey });
                entity.HasOne<ApplicationUser>()
                      .WithMany()
                      .HasForeignKey(l => l.UserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<IdentityUserToken<int>>(entity =>
            {
                entity.HasKey(t => new { t.UserId, t.LoginProvider, t.Name });
                entity.HasOne<ApplicationUser>()
                      .WithMany()
                      .HasForeignKey(t => t.UserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<IdentityUserClaim<int>>(entity =>
            {
                entity.HasOne<ApplicationUser>()
                      .WithMany()
                      .HasForeignKey(c => c.UserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<IdentityRoleClaim<int>>(entity =>
            {
                entity.HasOne<IdentityRole<int>>()
                      .WithMany()
                      .HasForeignKey(rc => rc.RoleId)
                      .OnDelete(DeleteBehavior.Restrict);
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

            // CompanyRecruiter
            modelBuilder.Entity<CompanyRecruiter>(entity =>
            {
                entity.HasIndex(e => new { e.CompanyId, e.UserId }).IsUnique();
                entity.HasOne(e => e.Company)
                      .WithMany(e => e.CompanyRecruiters)
                      .HasForeignKey(e => e.CompanyId)
                      .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.User)
                      .WithOne(e => e.CompanyRecruiter)
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
            modelBuilder.Entity<CandidateJob>(entity =>
            {
                entity.Property(e => e.Status).HasConversion<byte>().HasColumnType("tinyint");
                entity.HasOne(e => e.User)
                      .WithMany(e => e.ApplyJobs)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.Job)
                      .WithMany(e => e.CandidateJobs)
                      .HasForeignKey(e => e.JobId)
                      .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.CandidateCV)
                        .WithMany(e => e.CandidateJobs)
                        .HasForeignKey(e => e.CVId)
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
                    entity.HasMany(e => e.Reports)
                          .WithOne(e => e.ReportSolved)
                          .OnDelete(DeleteBehavior.NoAction);
                    entity.HasOne(e => e.User)
                            .WithMany(e => e.ReviewedReports)
                            .HasForeignKey(e => e.SolvedBy)
                            .OnDelete(DeleteBehavior.NoAction);
                });
            builder.Entity<Feedback>(entity => {
            });
            builder.Entity<Offer>(entity =>
            {
                entity.HasOne(e=>e.CandidateJob)
                        .WithOne(e=>e.Offer)
                        .HasForeignKey<Offer>(e=>e.CandidateJobId)
                        .OnDelete(DeleteBehavior.NoAction);
            });
            builder.Entity<JobStage>(entity =>
            {
                entity.HasOne(e => e.Job)
                     .WithMany(e => e.JobStages)
                     .HasForeignKey(e => e.JobId)
                     .OnDelete(DeleteBehavior.NoAction);
            });
            builder.Entity<CandidateStage>(entity =>
            {
                entity.HasOne(e => e.CandidateJob)
                     .WithMany(e => e.CandidateStages)
                     .HasForeignKey(e => e.CandidateJobId)
                     .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.JobStage)
                     .WithMany(e => e.CandidateStages)
                     .HasForeignKey(e => e.JobStageId)
                     .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.Code)
                      .WithOne(e => e.CandidateStage)
                      .HasForeignKey<CandidateStage>(e => e.CodeId)
                      .OnDelete(DeleteBehavior.NoAction);
            });
            builder.Entity<Code>(entity =>
            {
            });
            builder.Entity<CodeTestCase>(entity =>
            {
                entity.HasOne(e => e.Code)
                     .WithMany(e => e.CodeTestCases)
                     .HasForeignKey(e => e.CodeId)
                     .OnDelete(DeleteBehavior.NoAction);
            });
        }
    }
}
