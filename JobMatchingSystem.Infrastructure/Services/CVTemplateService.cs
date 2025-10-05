using JobMatchingSystem.Infrastructure.IServices;
using JobMatchingSystem.Infrastructure.Models;
using Microsoft.AspNetCore.Hosting;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Text;

namespace JobMatchingSystem.Infrastructure.Services
{
    public class CVTemplateService : ICVTemplateService
    {
        private readonly IWebHostEnvironment _environment;
        private readonly string _templatesPath;

        public CVTemplateService(IWebHostEnvironment environment)
        {
            _environment = environment;
            _templatesPath = Path.Combine(_environment.WebRootPath, "TemplateCV");
        }

        public async Task<List<CVTemplate>> GetAvailableTemplatesAsync()
        {
            var templates = new List<CVTemplate>();

            if (!Directory.Exists(_templatesPath))
            {
                Directory.CreateDirectory(_templatesPath);
                return templates;
            }

            var templateFiles = Directory.GetFiles(_templatesPath, "*.png")
                .Concat(Directory.GetFiles(_templatesPath, "*.jpg"))
                .Concat(Directory.GetFiles(_templatesPath, "*.jpeg"));

            foreach (var templateFile in templateFiles)
            {
                var fileName = Path.GetFileNameWithoutExtension(templateFile);
                var template = new CVTemplate
                {
                    TemplateId = fileName,
                    TemplateName = GetTemplateDisplayName(fileName),
                    TemplateImagePath = $"/TemplateCV/{Path.GetFileName(templateFile)}",
                    Description = GetTemplateDescription(fileName),
                    Style = GetTemplateStyle(fileName)
                };
                templates.Add(template);
            }

            return await Task.FromResult(templates);
        }

        public async Task<CVTemplate?> GetTemplateByIdAsync(string templateId)
        {
            var templates = await GetAvailableTemplatesAsync();
            return templates.FirstOrDefault(t => t.TemplateId == templateId);
        }

        public async Task<CVGenerationResult> GenerateCVFromTemplateAsync(string templateId, CVTemplateData cvData)
        {
            try
            {
                // Validate dữ liệu trước
                var (isValid, errors) = await ValidateCVDataAsync(cvData);
                if (!isValid)
                {
                    return new CVGenerationResult
                    {
                        Success = false,
                        ErrorMessage = $"Dữ liệu không hợp lệ: {string.Join(", ", errors)}"
                    };
                }

                var template = await GetTemplateByIdAsync(templateId);
                if (template == null)
                {
                    return new CVGenerationResult
                    {
                        Success = false,
                        ErrorMessage = "Không tìm thấy template"
                    };
                }

                // Tạo CV từ template
                var imageBytes = await GenerateCVImageAsync(template, cvData);
                var fileName = $"CV_{cvData.FullName?.Replace(" ", "_")}_{templateId}_{DateTime.Now:yyyyMMdd_HHmmss}.png";

                return new CVGenerationResult
                {
                    Success = true,
                    GeneratedImageBytes = imageBytes,
                    FileName = fileName,
                    UsedData = cvData,
                    UsedTemplateId = templateId
                };
            }
            catch (Exception ex)
            {
                return new CVGenerationResult
                {
                    Success = false,
                    ErrorMessage = $"Lỗi tạo CV: {ex.Message}"
                };
            }
        }

        public async Task<byte[]?> GetTemplatePreviewAsync(string templateId)
        {
            var template = await GetTemplateByIdAsync(templateId);
            if (template == null) return null;

            var templateFilePath = Path.Combine(_environment.WebRootPath, template.TemplateImagePath.TrimStart('/'));
            
            if (!File.Exists(templateFilePath)) return null;

            return await File.ReadAllBytesAsync(templateFilePath);
        }

        public async Task<CVGenerationResult> GenerateSampleCVAsync(string templateId)
        {
            var sampleData = new CVTemplateData
            {
                FullName = "Nguyễn Văn Thắng",
                JobTitle = "Senior Software Developer",
                Email = "thang.nguyen@example.com",
                PhoneNumber = "0123 456 789",
                Address = "Hà Nội, Việt Nam",
                Summary = "Experienced software developer with 5+ years in web development. Specialized in .NET technologies and modern web frameworks.",
                Skills = "C#, ASP.NET Core, SQL Server, JavaScript, React, Docker, Azure",
                Education = "Cử nhân Kỹ thuật Phần mềm - FPT University (2019-2023)\nGPA: 3.5/4.0",
                Experience = "Senior Developer - ABC Company (2022-Present)\n• Led development of e-commerce platform\n• Improved system performance by 40%\n\nJunior Developer - XYZ Corp (2021-2022)\n• Developed REST APIs using .NET Core\n• Collaborated with cross-functional teams",
                Projects = "JobMatching System - Web application for job recruitment\n• Technologies: ASP.NET Core, SQL Server, React\n• Role: Full-stack Developer\n\nE-commerce Platform - Online shopping system\n• Technologies: .NET 6, PostgreSQL, Angular\n• Role: Backend Developer",
                Achievements = "• Best Employee Award 2023\n• Microsoft Certified: Azure Developer Associate\n• Published 3 technical articles on Medium",
                Languages = "Vietnamese (Native), English (Professional), Japanese (Basic)",
                Hobbies = "Reading tech blogs, Playing guitar, Traveling"
            };

            return await GenerateCVFromTemplateAsync(templateId, sampleData);
        }

        public async Task<(bool IsValid, List<string> Errors)> ValidateCVDataAsync(CVTemplateData cvData)
        {
            var errors = new List<string>();

            if (string.IsNullOrWhiteSpace(cvData.FullName))
                errors.Add("Tên không được để trống");

            if (string.IsNullOrWhiteSpace(cvData.Email))
                errors.Add("Email không được để trống");
            else if (!IsValidEmail(cvData.Email))
                errors.Add("Email không đúng định dạng");

            if (string.IsNullOrWhiteSpace(cvData.PhoneNumber))
                errors.Add("Số điện thoại không được để trống");

            if (string.IsNullOrWhiteSpace(cvData.Skills))
                errors.Add("Kỹ năng không được để trống");

            return await Task.FromResult((errors.Count == 0, errors));
        }

        private async Task<byte[]> GenerateCVImageAsync(CVTemplate template, CVTemplateData cvData)
        {
            var templateFilePath = Path.Combine(_environment.WebRootPath, template.TemplateImagePath.TrimStart('/'));
            
            using var templateImage = Image.FromFile(templateFilePath);
            using var bitmap = new Bitmap(templateImage.Width, templateImage.Height);
            using var graphics = Graphics.FromImage(bitmap);
            
            // Vẽ template gốc lên canvas
            graphics.DrawImage(templateImage, 0, 0);
            
            // Cấu hình text rendering
            graphics.TextRenderingHint = TextRenderingHint.AntiAlias;
            
            // Vẽ thông tin lên template theo style
            await DrawTextOnTemplate(graphics, template.Style, cvData);
            
            // Convert thành byte array
            using var stream = new MemoryStream();
            bitmap.Save(stream, ImageFormat.Png);
            return stream.ToArray();
        }

        private async Task DrawTextOnTemplate(Graphics graphics, CVTemplateStyle style, CVTemplateData cvData)
        {
            var primaryBrush = new SolidBrush(ColorTranslator.FromHtml(style.PrimaryColor));
            var secondaryBrush = new SolidBrush(ColorTranslator.FromHtml(style.SecondaryColor));

            // Vẽ tên (tăng font size cho tên)
            if (!string.IsNullOrWhiteSpace(cvData.FullName))
            {
                var nameFont = new Font(style.FontFamily, style.BaseFontSize + 6, FontStyle.Bold);
                DrawTextAtPosition(graphics, cvData.FullName, nameFont, primaryBrush, style.NamePosition);
            }

            // Vẽ job title
            if (!string.IsNullOrWhiteSpace(cvData.JobTitle))
            {
                var jobFont = new Font(style.FontFamily, style.BaseFontSize + 2, FontStyle.Regular);
                DrawTextAtPosition(graphics, cvData.JobTitle, jobFont, secondaryBrush, style.JobTitlePosition);
            }

            // Vẽ thông tin liên hệ
            var contactInfo = $"{cvData.Email}\n{cvData.PhoneNumber}\n{cvData.Address}".Trim();
            if (!string.IsNullOrWhiteSpace(contactInfo))
            {
                var contactFont = new Font(style.FontFamily, style.BaseFontSize, FontStyle.Regular);
                DrawTextAtPosition(graphics, contactInfo, contactFont, secondaryBrush, style.ContactPosition);
            }

            // Vẽ summary
            if (!string.IsNullOrWhiteSpace(cvData.Summary))
            {
                var summaryFont = new Font(style.FontFamily, style.BaseFontSize, FontStyle.Regular);
                DrawTextAtPosition(graphics, cvData.Summary, summaryFont, secondaryBrush, style.SummaryPosition);
            }

            // Vẽ skills
            if (!string.IsNullOrWhiteSpace(cvData.Skills))
            {
                var skillsFont = new Font(style.FontFamily, style.BaseFontSize, FontStyle.Regular);
                DrawTextAtPosition(graphics, cvData.Skills, skillsFont, secondaryBrush, style.SkillsPosition);
            }

            // Vẽ education
            if (!string.IsNullOrWhiteSpace(cvData.Education))
            {
                var eduFont = new Font(style.FontFamily, style.BaseFontSize, FontStyle.Regular);
                DrawTextAtPosition(graphics, cvData.Education, eduFont, secondaryBrush, style.EducationPosition);
            }

            // Vẽ experience
            if (!string.IsNullOrWhiteSpace(cvData.Experience))
            {
                var expFont = new Font(style.FontFamily, style.BaseFontSize, FontStyle.Regular);
                DrawTextAtPosition(graphics, cvData.Experience, expFont, secondaryBrush, style.ExperiencePosition);
            }

            await Task.CompletedTask;
        }

        private void DrawTextAtPosition(Graphics graphics, string text, Font font, Brush brush, TextPosition position)
        {
            if (position.Width == 0 || position.Height == 0) return;

            var rect = new RectangleF(position.X, position.Y, position.Width, position.Height);
            var format = new StringFormat();
            
            // Set text alignment
            switch (position.TextAlign.ToLower())
            {
                case "center":
                    format.Alignment = StringAlignment.Center;
                    break;
                case "right":
                    format.Alignment = StringAlignment.Far;
                    break;
                default:
                    format.Alignment = StringAlignment.Near;
                    break;
            }
            
            format.LineAlignment = StringAlignment.Near;
            graphics.DrawString(text, font, brush, rect, format);
        }

        private string GetTemplateDisplayName(string templateId)
        {
            return templateId switch
            {
                "template1" => "Professional Classic",
                "template2" => "Modern Minimalist", 
                "template3" => "Creative Designer",
                "template4" => "Corporate Standard",
                "template5" => "Tech Developer",
                _ => $"Template {templateId}"
            };
        }

        private string GetTemplateDescription(string templateId)
        {
            return templateId switch
            {
                "template1" => "Traditional professional layout suitable for corporate environments",
                "template2" => "Clean and minimal design perfect for modern professionals",
                "template3" => "Creative layout ideal for designers and creative roles",
                "template4" => "Standard corporate format for business professionals",
                "template5" => "Tech-focused design perfect for developers and IT professionals",
                _ => "Customizable CV template"
            };
        }

        private CVTemplateStyle GetTemplateStyle(string templateId)
        {
            // Định nghĩa style cơ bản cho từng template
            // Trong thực tế, có thể load từ config file hoặc database
            return templateId switch
            {
                "template1" => new CVTemplateStyle
                {
                    NamePosition = new TextPosition { X = 50, Y = 50, Width = 400, Height = 50, FontSize = 24 },
                    JobTitlePosition = new TextPosition { X = 50, Y = 100, Width = 400, Height = 30, FontSize = 16 },
                    ContactPosition = new TextPosition { X = 50, Y = 140, Width = 300, Height = 80, FontSize = 12 },
                    SummaryPosition = new TextPosition { X = 50, Y = 240, Width = 500, Height = 100, FontSize = 12 },
                    SkillsPosition = new TextPosition { X = 50, Y = 360, Width = 250, Height = 150, FontSize = 12 },
                    EducationPosition = new TextPosition { X = 320, Y = 360, Width = 250, Height = 150, FontSize = 12 },
                    ExperiencePosition = new TextPosition { X = 50, Y = 530, Width = 520, Height = 200, FontSize = 12 },
                    PrimaryColor = "#2C3E50",
                    SecondaryColor = "#34495E",
                    FontFamily = "Arial",
                    BaseFontSize = 12
                },
                "template2" => new CVTemplateStyle
                {
                    NamePosition = new TextPosition { X = 200, Y = 80, Width = 400, Height = 50, FontSize = 28, TextAlign = "Center" },
                    JobTitlePosition = new TextPosition { X = 200, Y = 130, Width = 400, Height = 30, FontSize = 16, TextAlign = "Center" },
                    ContactPosition = new TextPosition { X = 200, Y = 170, Width = 400, Height = 60, FontSize = 12, TextAlign = "Center" },
                    SummaryPosition = new TextPosition { X = 80, Y = 250, Width = 540, Height = 80, FontSize = 12 },
                    SkillsPosition = new TextPosition { X = 80, Y = 350, Width = 260, Height = 140, FontSize = 12 },
                    EducationPosition = new TextPosition { X = 360, Y = 350, Width = 260, Height = 140, FontSize = 12 },
                    ExperiencePosition = new TextPosition { X = 80, Y = 510, Width = 540, Height = 180, FontSize = 12 },
                    PrimaryColor = "#3498DB",
                    SecondaryColor = "#2C3E50",
                    FontFamily = "Calibri",
                    BaseFontSize = 12
                },
                _ => new CVTemplateStyle
                {
                    NamePosition = new TextPosition { X = 50, Y = 50, Width = 400, Height = 50, FontSize = 24 },
                    JobTitlePosition = new TextPosition { X = 50, Y = 100, Width = 400, Height = 30, FontSize = 16 },
                    ContactPosition = new TextPosition { X = 50, Y = 140, Width = 300, Height = 80, FontSize = 12 },
                    SummaryPosition = new TextPosition { X = 50, Y = 240, Width = 500, Height = 100, FontSize = 12 },
                    SkillsPosition = new TextPosition { X = 50, Y = 360, Width = 250, Height = 150, FontSize = 12 },
                    EducationPosition = new TextPosition { X = 320, Y = 360, Width = 250, Height = 150, FontSize = 12 },
                    ExperiencePosition = new TextPosition { X = 50, Y = 530, Width = 520, Height = 200, FontSize = 12 },
                    PrimaryColor = "#000000",
                    SecondaryColor = "#666666",
                    FontFamily = "Arial",
                    BaseFontSize = 12
                }
            };
        }

        private bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }
    }
}