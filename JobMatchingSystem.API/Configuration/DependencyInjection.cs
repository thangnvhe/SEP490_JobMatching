using JobMatchingSystem.API.Repositories.Implementations;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Implementations;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;

namespace JobMatchingSystem.API.Configuration
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddRepositories(this IServiceCollection services)
        {
            //services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IAuthRepository, AuthRepository>();
            services.AddScoped<IJobRepository, JobRepository>();
            services.AddScoped<ICompanyRepository, CompanyRepository>();
            services.AddScoped<IJobStageRepository, JobStageRepository>();
            services.AddScoped<ITaxonomyRepository, TaxonomyRepository>();
            services.AddScoped<ICandidateJobRepository, CandidateJobRepository>();
            services.AddScoped<ICvUploadRepository, CvUploadRepository>();
            services.AddScoped<ITemplateCvRepository, TemplateCvRepository>();
            services.AddScoped<ICVRepository, CVRepository>();
            services.AddScoped<ICandidateStageRepository, CandidateStageRepository>();
            services.AddScoped<ICVAchievementRepository, CVAchievementRepository>();
            services.AddScoped<ICVCertificateRepository, CVCertificateRepository>();
            services.AddScoped<ICVEducationRepository, CVEducationRepository>();
            services.AddScoped<ICVExperienceRepository, CVExperienceRepository>();
            services.AddScoped<ICVProjectRepository, CVProjectRepository>();
            services.AddScoped<IReportRepository, ReportRepository>();
            return services;
        }

        public static IServiceCollection AddServices(this IServiceCollection services)
        {
            //services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddTransient<IEmailService, EmailService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IJobService, JobService>();
            services.AddScoped<ICompanyService, CompanyService>();
            services.AddScoped<IJobStageService, JobStageService>();
            services.AddScoped<ITaxonomyService, TaxonomyService>();
            services.AddScoped<ICandidateJobService, CandidateJobService>();
            services.AddTransient<ITemplateCvService, TemplateCvService>();
            services.AddTransient<ICVService, CVService>();
            services.AddScoped<ICandidateStageService, CandidateStageService>();
            services.AddScoped<ITemplateCvService, TemplateCvService>();
            services.AddScoped<ICVService, CVService>();
            services.AddScoped<ICVAchievementService, CVAchievementService>();
            services.AddScoped<ICVCertificateService, CVCertificateService>();
            services.AddScoped<ICVEducationService, CVEducationService>();
            services.AddScoped<ICVExperienceService, CVExperienceService>();
            services.AddScoped<ICVProjectService, CVProjectService>();
            services.AddScoped<IReportService, ReportService>();
            return services;
        }

        public static IServiceCollection AddUnitOfWork(this IServiceCollection services)
        {
            //services.AddScoped<IUnitOfWork, UnitOfWork>();
            return services;
        }

        public static IServiceCollection AddDatabaseContext(this IServiceCollection services, IConfiguration configuration)
        {
            //services.AddDbContext<AppDbContext>(options =>
            //    options.UseSqlServer(configuration.GetConnectionString("DefaultConnectionString")));
            return services;
        }
    }
}
