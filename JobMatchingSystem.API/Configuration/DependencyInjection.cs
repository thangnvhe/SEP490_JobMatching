using JobMatchingSystem.API.Mappings;
using JobMatchingSystem.API.Repositories.Implementations;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Implementations;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using AutoMapper;

namespace JobMatchingSystem.API.Configuration
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddRepositories(this IServiceCollection services)
        {
            services.AddScoped<IAuthRepository, AuthRepository>();
            services.AddScoped<ICompanyRecruiterRepository, CompanyRecruiterRepository>();
            services.AddScoped<IJobRepository, JobRepository>();
            services.AddScoped<ICandidateProfileRepository, CandidateProfileRepository>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<ICompanyRepository, CompanyRepository>();
            services.AddScoped<ICandidateProfileRepository, CandidateProfileRepository>();
            services.AddScoped<ICodeRepository, CodeRepository>();
            services.AddScoped<ICodeTestRepository, CodeTestRepository>();
            services.AddScoped<ITemplateCVRepository, TemplateCVRepository>();
            services.AddScoped<IDataCVRepository, DataCVRepository>();
            services.AddScoped<ITaxonomyRepository, TaxonomyRepository>();
            return services;
        }

        public static IServiceCollection AddServices(this IServiceCollection services)
        {
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<ICompanyService, CompanyService>();
            services.AddTransient<IEmailService, EmailService>();
            services.AddScoped<IJobService, JobService>();
            services.AddScoped<ICandidateProfileService, CandidateProfileService>();
            services.AddScoped<ICodeService, CodeService>();
            services.AddScoped<ICodeTestService, CodeTestService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<ITemplateCVService, TemplateCVService>();
            services.AddScoped<ICVTemplateService, CVTemplateService>();
            services.AddScoped<IDataCVService, DataCVService>();
            services.AddScoped<ITaxonomyService, TaxonomyService>();
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
