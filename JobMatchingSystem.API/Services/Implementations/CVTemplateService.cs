// Services/Implementations/CVTemplateService.cs
using HandlebarsDotNet;
using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Entities;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using System.Text;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class CVTemplateService : ICVTemplateService
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;

        public CVTemplateService(ApplicationDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        public async Task<byte[]> GenerateCVHtmlAsync(int userId, int templateId)
        {
            // 1. Lấy user
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) throw new AppException(ErrorCode.NotFoundUser());

            // 2. Lấy template
            var template = await _context.TemplateCVs
                .FirstOrDefaultAsync(t => t.TemplateId == templateId && t.IsActive == true);

            if (template == null || string.IsNullOrEmpty(template.PathUrl))
                throw new AppException(ErrorCode.NotFoundTemplateCV());

            // 3. Đọc file HTML
            var templatePath = Path.Combine(_env.WebRootPath, template.PathUrl.TrimStart('/'));
            if (!File.Exists(templatePath))
                throw new AppException(ErrorCode.NotFoundTemplateCV());

            var htmlTemplate = await File.ReadAllTextAsync(templatePath, Encoding.UTF8);

            // Lấy các phần con
            var skills = await GetListAsync<CVSkill>(userId);
            var certs = await GetListAsync<CVCertificate>(userId);
            var exps = await GetListAsync<CVExperience>(userId);
            var projects = await GetListAsync<CVProject>(userId);
            var educations = await GetListAsync<CVEducation>(userId);
            var achievements = await GetListAsync<CVAchievement>(userId);

            // 5. Tạo model cho Handlebars
            var model = new
            {
                User = new
                {
                    user.FullName,
                    user.Email,
                    user.PhoneNumber,
                    Birthday = user.Birthday?.ToString("dd/MM/yyyy") ?? "không có thông tin"
                },

                //Title = "CV của tôi",
                //Summary = "không có thông tin",

                CVSkills = skills.Any() ? skills.Select(s => new
                {
                    s.Name,
                    Level = s.Level ?? 0
                }) : new[] { new { Name = "không có thông tin", Level = 0 } },

                CVCertificates = certs.Any() ? certs.Select(c => new
                {
                    c.Name,
                    c.Organization,
                    CertificateAt = c.CertificateAt?.ToString("MM/yyyy") ?? "không rõ",
                    c.Description,
                    c.Link
                }) : new[] { new { Name = "không có thông tin", Organization = "", CertificateAt = "", Description = "", Link = (string?)null } },

                CVAchievements = achievements.Any() ? achievements.Select(a => new
                {
                    a.Title,
                    a.Organization,
                    AchievedAt = a.AchievedAt?.ToString("MM/yyyy") ?? "không rõ",
                    a.Description
                }) : new[] { new { Title = "không có thông tin", Organization = "", AchievedAt = "", Description = "" } },

                CVExperiences = exps.Any() ? exps.Select(e => new
                {
                    e.Position,
                    e.CompanyName,
                    StartDate = e.StartDate?.ToString("MM/yyyy") ?? "",
                    EndDate = e.EndDate?.ToString("MM/yyyy") ?? "Hiện tại",
                    e.Description
                }) : new[] { new { Position = "không có thông tin", CompanyName = "", StartDate = "", EndDate = "", Description = "" } },

                CVProjects = projects.Any() ? projects.Select(p => new
                {
                    p.ProjectName,
                    p.Role,
                    StartDate = p.StartDate?.ToString("MM/yyyy") ?? "",
                    EndDate = p.EndDate?.ToString("MM/yyyy") ?? "Hiện tại",
                    p.Description
                }) : new[] { new { ProjectName = "không có thông tin", Role = "", StartDate = "", EndDate = "", Description = "" } },

                CVEducations = educations.Any() ? educations.Select(e => new
                {
                    e.SchoolName,
                    e.Major,
                    Degree = e.Degree?.ToString() ?? "Khác",
                    StartDate = e.StartDate?.ToString("MM/yyyy") ?? "",
                    EndDate = e.EndDate?.ToString("MM/yyyy") ?? "Hiện tại",
                    e.Description
                }) : new[] { new { SchoolName = "không có thông tin", Major = "", Degree = "", StartDate = "", EndDate = "", Description = "" } }
            };

            // 6. Compile và render với Handlebars
            var handlebars = Handlebars.Compile(htmlTemplate);
            var renderedHtml = handlebars(model);

            return Encoding.UTF8.GetBytes(renderedHtml);
        }

        private async Task<List<T>> GetListAsync<T>(int userId) where T : class
        {
            var query = _context.Set<T>().AsQueryable();
            query = query.Where(EntityHasUserId<T>(userId));

            return await query.ToListAsync();
        }

        private static Expression<Func<T, bool>> EntityHasUserId<T>(int userId)
        {
            var param = Expression.Parameter(typeof(T), "e");
            var prop = Expression.Property(param, "UserId");
            var body = Expression.Equal(prop, Expression.Constant(userId, typeof(int?)));
            return Expression.Lambda<Func<T, bool>>(body, param);
        }
    }
}