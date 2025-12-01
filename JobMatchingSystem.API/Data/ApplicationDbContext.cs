using JobMatchingSystem.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;

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
        public DbSet<Company> Companies { get; set; }
        public DbSet<BankTransactionHistory> BankTransactionHistorys { get; set; }
        public DbSet<Job> Jobs { get; set; }
        public DbSet<CandidateJob> CandidateJobs { get; set; }
        public DbSet<SavedJob> SavedJobs { get; set; }
        public DbSet<SavedCV> SavedCVs { get; set; }
        public DbSet<CVUpload> CVUploads { get; set; }
        public DbSet<CVExperience> CVExperiences { get; set; }
        public DbSet<CVEducation> CVEducations { get; set; }
        public DbSet<CVProject> CVProjects { get; set; }
        public DbSet<CVCertificate> CVCertificates { get; set; }
        public DbSet<CVAchievement> CVAchievements { get; set; }
        public DbSet<CVProfile> CVProfiles { get; set; }
        public DbSet<Taxonomy> Taxonomies { get; set; }
        public DbSet<Report> Reports { get; set; }
        public DbSet<TemplateCV> TemplateCVs { get; set; }
        public DbSet<JobStage> JobStages { get; set; }
        public DbSet<CandidateStage> CandidateStages { get; set; }
        public DbSet<JobTaxonomy> JobTaxonomies { get; set; }
        public DbSet<CandidateTaxonomy> CandidateTaxonomies { get; set; }
        public DbSet<ServicePlan> ServicePlans { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<JobQuota> JobQuotas { get; set; }
        public DbSet<HighlightJob> HighlightJobs { get; set; }
        public DbSet<ExtensionJob> ExtensionJobs { get; set; }
        public DbSet<Position> Positions { get; set; }

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
                entity.HasMany(e => e.Jobs)
                        .WithOne(e => e.Company)
                        .HasForeignKey(e => e.CompanyId)
                        .OnDelete(DeleteBehavior.NoAction);
                entity.HasMany(e=>e.ApplicationUsers)
                        .WithOne(e=>e.CompanyRecruiter)
                        .HasForeignKey(e=>e.CompanyId)
                        .OnDelete(DeleteBehavior.NoAction);
                entity.HasIndex(e => e.Email).IsUnique();
            });

            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasOne(o => o.Buyer)
                      .WithMany(u => u.Orders)
                      .HasForeignKey(o => o.BuyerId)
                      .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(o => o.ServicePlan)
                      .WithMany(s => s.Orders)
                      .HasForeignKey(o => o.ServiceId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            modelBuilder.Entity<JobQuota>(entity =>
            {
                entity.HasOne(j => j.Recruiter)
                      .WithOne(u => u.JobQuota)
                      .HasForeignKey<JobQuota>(j => j.RecruiterId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            // HighlightJob
            modelBuilder.Entity<HighlightJob>(entity =>
            {
                entity.HasKey(e => e.Id);

                // Mỗi HighlightJob thuộc về 1 Recruiter
                entity.HasOne(e => e.Recruiter)
                      .WithMany(u => u.HighlightJobs)
                      .HasForeignKey(e => e.RecuiterId)
                      .OnDelete(DeleteBehavior.NoAction); // Không xóa cascade khi xóa user
            });

            // ExtensionJob
            modelBuilder.Entity<ExtensionJob>(entity =>
            {
                entity.HasKey(e => e.Id);

                // Mỗi ExtensionJob thuộc về 1 Recruiter
                entity.HasOne(e => e.Recruiter)
                      .WithMany(u => u.ExtensionJobs)
                      .HasForeignKey(e => e.RecuiterId)
                      .OnDelete(DeleteBehavior.NoAction); // Không xóa cascade khi xóa user
            });

            // Position
            modelBuilder.Entity<Position>(entity =>
            {
                entity.Property(e => e.Name)
                      .IsRequired()
                      .HasMaxLength(100);

                // 1 Position - nhiều Users
                entity.HasMany(e => e.Candidates)
                      .WithOne(u => u.Position)
                      .HasForeignKey(u => u.PositionId)
                      .OnDelete(DeleteBehavior.SetNull);

                // 1 Position - nhiều Jobs
                entity.HasMany(e => e.Jobs)
                      .WithOne(j => j.Position)
                      .HasForeignKey(j => j.PositionId)
                      .OnDelete(DeleteBehavior.SetNull);
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

            // Job
            modelBuilder.Entity<Job>(entity =>
            {
                entity.Property(e => e.Status).HasConversion<byte>().HasColumnType("tinyint");
                entity.HasOne(e => e.Company)
                      .WithMany(e => e.Jobs)
                      .HasForeignKey(e => e.CompanyId)
                      .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.Recruiter)
                      .WithMany(e => e.CreatedJobs)
                      .HasForeignKey(e => e.RecuiterId)
                      .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.Admin)
                      .WithMany(e => e.AdminJobs)
                      .HasForeignKey(e => e.VerifiedBy)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            // ApplyJob
            modelBuilder.Entity<CandidateJob>(entity =>
            {
                entity.Property(e => e.Status).HasConversion<byte>().HasColumnType("tinyint");
                entity.HasOne(e => e.Job)
                      .WithMany(e => e.CandidateJobs)
                      .HasForeignKey(e => e.JobId)
                      .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.CVUpload)
                        .WithMany(e => e.CandidateJobs)
                        .HasForeignKey(e => e.CVId)
                        .OnDelete(DeleteBehavior.Cascade);
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
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // DataCV
            modelBuilder.Entity<CVUpload>(entity =>
            {
                entity.HasOne(e => e.User)
                      .WithMany(e => e.DataCVs)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.NoAction);

            });

            // JobTaxonomy
            modelBuilder.Entity<JobTaxonomy>(entity =>
            {
                entity.HasOne(e => e.Job)
                      .WithMany(e => e.JobTaxonomies)
                      .HasForeignKey(e => e.JobId)
                      .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.Taxonomy)
                      .WithMany(e => e.JobTaxonomies)
                      .HasForeignKey(e => e.TaxonomyId)
                      .OnDelete(DeleteBehavior.NoAction);
            });
            // CandidateTaxonomy
            modelBuilder.Entity<CandidateTaxonomy>(entity =>
            {
                entity.HasOne(e => e.Candidate)
                      .WithMany(e => e.CandidateTaxonomies)
                      .HasForeignKey(e => e.CandidateId)
                      .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.Taxonomy)
                      .WithMany(e => e.CandidateTaxonomies)
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
                entity.HasOne(e => e.User)
                      .WithMany(e=>e.CVExperiences)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            builder.Entity<CVEducation>(entity =>
            {
                entity.HasOne(e => e.User)
                      .WithMany(e=>e.CVEducations)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            builder.Entity<CVProject>(entity =>
            {
                entity.HasOne(e => e.User)
                      .WithMany(e=>e.CVProjects)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            builder.Entity<CVCertificate>(entity =>
            {
                entity.HasOne(e => e.User)
                      .WithMany(e=>e.CVCertificates)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            builder.Entity<CVAchievement>(entity =>
            {
                entity.HasOne(e => e.User)
                      .WithMany(e=>e.CVAchievements)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            builder.Entity<CVProfile>(entity =>
            {
                // Quan hệ 1-1 với ApplicationUser
                entity.HasOne(e => e.User)
                      .WithOne(u => u.CVProfile)
                      .HasForeignKey<CVProfile>(e => e.UserId)
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
                      .WithMany(e => e.CreateReports)
                      .HasForeignKey(e => e.ReporterId)
                      .OnDelete(DeleteBehavior.NoAction);
                entity.HasOne(e => e.VerifiedBy)
                        .WithMany(e => e.VerifiedReports)
                        .HasForeignKey(e => e.VerifiedId)
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
            });
        }
    }
}
