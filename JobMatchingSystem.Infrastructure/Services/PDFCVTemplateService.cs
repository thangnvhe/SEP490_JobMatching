using JobMatchingSystem.Infrastructure.IServices;
using JobMatchingSystem.Infrastructure.Models;
using Microsoft.AspNetCore.Hosting;
using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using iText.Layout.Properties;
using iText.Kernel.Colors;
using iText.Kernel.Font;
using iText.IO.Font.Constants;
using System.Drawing;
using System.Drawing.Imaging;

namespace JobMatchingSystem.Infrastructure.Services
{
    public class PDFCVTemplateService : ICVTemplateService
    {
        private readonly IWebHostEnvironment _environment;
        private readonly string _templatesPath;

        public PDFCVTemplateService(IWebHostEnvironment environment)
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
                var template = await GetTemplateByIdAsync(templateId);
                if (template == null)
                {
                    return new CVGenerationResult
                    {
                        Success = false,
                        ErrorMessage = "Template không tồn tại"
                    };
                }

                // Validate data
                var (isValid, errors) = await ValidateCVDataAsync(cvData);
                if (!isValid)
                {
                    return new CVGenerationResult
                    {
                        Success = false,
                        ErrorMessage = string.Join(", ", errors)
                    };
                }

                // Generate PDF based on template style
                var pdfBytes = await GeneratePDFFromTemplate(templateId, cvData);

                return new CVGenerationResult
                {
                    Success = true,
                    GeneratedImageBytes = pdfBytes, // This will actually be PDF bytes
                    FileName = $"CV_{cvData.FullName?.Replace(" ", "_")}_{templateId}.pdf"
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

        private async Task<byte[]> GeneratePDFFromTemplate(string templateId, CVTemplateData cvData)
        {
            using var ms = new MemoryStream();
            using var writer = new PdfWriter(ms);
            using var pdf = new PdfDocument(writer);
            var document = new Document(pdf);

            // Set up fonts
            var titleFont = PdfFontFactory.CreateFont(StandardFonts.HELVETICA_BOLD);
            var headerFont = PdfFontFactory.CreateFont(StandardFonts.HELVETICA_BOLD);
            var normalFont = PdfFontFactory.CreateFont(StandardFonts.HELVETICA);

            // Generate PDF based on template style
            await GenerateTemplateBasedPDF(document, templateId, cvData, titleFont, headerFont, normalFont);

            document.Close();
            return ms.ToArray();
        }

        private async Task GenerateTemplateBasedPDF(Document document, string templateId, CVTemplateData cvData, 
            PdfFont titleFont, PdfFont headerFont, PdfFont normalFont)
        {
            // Different layout based on template
            switch (templateId.ToLower())
            {
                case "theme1":
                    await GenerateModernTemplate(document, cvData, titleFont, headerFont, normalFont);
                    break;
                case "theme2":
                    await GenerateClassicTemplate(document, cvData, titleFont, headerFont, normalFont);
                    break;
                case "theme3":
                    await GenerateCreativeTemplate(document, cvData, titleFont, headerFont, normalFont);
                    break;
                default:
                    await GenerateDefaultTemplate(document, cvData, titleFont, headerFont, normalFont);
                    break;
            }
        }

        private async Task GenerateModernTemplate(Document document, CVTemplateData cvData, 
            PdfFont titleFont, PdfFont headerFont, PdfFont normalFont)
        {
            // Header with name and title
            if (!string.IsNullOrWhiteSpace(cvData.FullName))
            {
                var nameTitle = new Paragraph(cvData.FullName)
                    .SetFont(titleFont)
                    .SetFontSize(24)
                    .SetFontColor(ColorConstants.DARK_GRAY)
                    .SetTextAlignment(TextAlignment.CENTER);
                document.Add(nameTitle);
            }

            if (!string.IsNullOrWhiteSpace(cvData.JobTitle))
            {
                var jobTitle = new Paragraph(cvData.JobTitle)
                    .SetFont(headerFont)
                    .SetFontSize(14)
                    .SetFontColor(ColorConstants.BLUE)
                    .SetTextAlignment(TextAlignment.CENTER)
                    .SetMarginBottom(20);
                document.Add(jobTitle);
            }

            // Contact Information
            await AddContactSection(document, cvData, headerFont, normalFont);

            // Summary
            if (!string.IsNullOrWhiteSpace(cvData.Summary))
            {
                await AddSection(document, "SUMMARY", cvData.Summary, headerFont, normalFont);
            }

            // Experience
            if (!string.IsNullOrWhiteSpace(cvData.Experience))
            {
                await AddSection(document, "EXPERIENCE", cvData.Experience, headerFont, normalFont);
            }

            // Education
            if (!string.IsNullOrWhiteSpace(cvData.Education))
            {
                await AddSection(document, "EDUCATION", cvData.Education, headerFont, normalFont);
            }

            // Skills
            if (!string.IsNullOrWhiteSpace(cvData.Skills))
            {
                await AddSection(document, "SKILLS", cvData.Skills, headerFont, normalFont);
            }

            // Projects
            if (!string.IsNullOrWhiteSpace(cvData.Projects))
            {
                await AddSection(document, "PROJECTS", cvData.Projects, headerFont, normalFont);
            }

            // Languages
            if (!string.IsNullOrWhiteSpace(cvData.Languages))
            {
                await AddSection(document, "LANGUAGES", cvData.Languages, headerFont, normalFont);
            }

            await Task.CompletedTask;
        }

        private async Task GenerateClassicTemplate(Document document, CVTemplateData cvData, 
            PdfFont titleFont, PdfFont headerFont, PdfFont normalFont)
        {
            // Classic layout with left sidebar
            var table = new Table(UnitValue.CreatePercentArray(new float[] { 30, 70 }))
                .UseAllAvailableWidth();

            // Left column
            var leftCell = new Cell()
                .SetBackgroundColor(ColorConstants.LIGHT_GRAY)
                .SetPadding(10);

            // Right column  
            var rightCell = new Cell()
                .SetPadding(10);

            // Add content to left column
            if (!string.IsNullOrWhiteSpace(cvData.FullName))
            {
                leftCell.Add(new Paragraph(cvData.FullName)
                    .SetFont(titleFont)
                    .SetFontSize(18)
                    .SetMarginBottom(5));
            }

            if (!string.IsNullOrWhiteSpace(cvData.JobTitle))
            {
                leftCell.Add(new Paragraph(cvData.JobTitle)
                    .SetFont(headerFont)
                    .SetFontSize(12)
                    .SetMarginBottom(15));
            }

            // Contact info in left column
            await AddContactToCell(leftCell, cvData, headerFont, normalFont);

            // Skills in left column
            if (!string.IsNullOrWhiteSpace(cvData.Skills))
            {
                await AddSectionToCell(leftCell, "SKILLS", cvData.Skills, headerFont, normalFont);
            }

            // Languages in left column
            if (!string.IsNullOrWhiteSpace(cvData.Languages))
            {
                await AddSectionToCell(leftCell, "LANGUAGES", cvData.Languages, headerFont, normalFont);
            }

            // Add content to right column
            if (!string.IsNullOrWhiteSpace(cvData.Summary))
            {
                await AddSectionToCell(rightCell, "SUMMARY", cvData.Summary, headerFont, normalFont);
            }

            if (!string.IsNullOrWhiteSpace(cvData.Experience))
            {
                await AddSectionToCell(rightCell, "EXPERIENCE", cvData.Experience, headerFont, normalFont);
            }

            if (!string.IsNullOrWhiteSpace(cvData.Education))
            {
                await AddSectionToCell(rightCell, "EDUCATION", cvData.Education, headerFont, normalFont);
            }

            if (!string.IsNullOrWhiteSpace(cvData.Projects))
            {
                await AddSectionToCell(rightCell, "PROJECTS", cvData.Projects, headerFont, normalFont);
            }

            table.AddCell(leftCell);
            table.AddCell(rightCell);
            document.Add(table);

            await Task.CompletedTask;
        }

        private async Task GenerateCreativeTemplate(Document document, CVTemplateData cvData, 
            PdfFont titleFont, PdfFont headerFont, PdfFont normalFont)
        {
            // Creative template with color blocks
            if (!string.IsNullOrWhiteSpace(cvData.FullName))
            {
                var nameBlock = new Paragraph(cvData.FullName)
                    .SetFont(titleFont)
                    .SetFontSize(28)
                    .SetFontColor(ColorConstants.WHITE)
                    .SetBackgroundColor(ColorConstants.BLUE)
                    .SetPadding(15)
                    .SetTextAlignment(TextAlignment.CENTER)
                    .SetMarginBottom(0);
                document.Add(nameBlock);
            }

            if (!string.IsNullOrWhiteSpace(cvData.JobTitle))
            {
                var jobBlock = new Paragraph(cvData.JobTitle)
                    .SetFont(headerFont)
                    .SetFontSize(16)
                    .SetFontColor(ColorConstants.WHITE)
                    .SetBackgroundColor(ColorConstants.DARK_GRAY)
                    .SetPadding(10)
                    .SetTextAlignment(TextAlignment.CENTER)
                    .SetMarginBottom(20);
                document.Add(jobBlock);
            }

            // Rest of the content with creative styling
            await AddContactSection(document, cvData, headerFont, normalFont);

            if (!string.IsNullOrWhiteSpace(cvData.Summary))
            {
                await AddColoredSection(document, "SUMMARY", cvData.Summary, headerFont, normalFont, ColorConstants.BLUE);
            }

            if (!string.IsNullOrWhiteSpace(cvData.Experience))
            {
                await AddColoredSection(document, "EXPERIENCE", cvData.Experience, headerFont, normalFont, ColorConstants.GREEN);
            }

            if (!string.IsNullOrWhiteSpace(cvData.Education))
            {
                await AddColoredSection(document, "EDUCATION", cvData.Education, headerFont, normalFont, ColorConstants.ORANGE);
            }

            if (!string.IsNullOrWhiteSpace(cvData.Skills))
            {
                await AddColoredSection(document, "SKILLS", cvData.Skills, headerFont, normalFont, ColorConstants.RED);
            }

            await Task.CompletedTask;
        }

        private async Task GenerateDefaultTemplate(Document document, CVTemplateData cvData, 
            PdfFont titleFont, PdfFont headerFont, PdfFont normalFont)
        {
            // Simple default template
            if (!string.IsNullOrWhiteSpace(cvData.FullName))
            {
                var name = new Paragraph(cvData.FullName)
                    .SetFont(titleFont)
                    .SetFontSize(22)
                    .SetTextAlignment(TextAlignment.CENTER)
                    .SetMarginBottom(5);
                document.Add(name);
            }

            if (!string.IsNullOrWhiteSpace(cvData.JobTitle))
            {
                var job = new Paragraph(cvData.JobTitle)
                    .SetFont(headerFont)
                    .SetFontSize(14)
                    .SetTextAlignment(TextAlignment.CENTER)
                    .SetMarginBottom(20);
                document.Add(job);
            }

            await AddContactSection(document, cvData, headerFont, normalFont);

            // Add all sections if they have content
            var sections = new Dictionary<string, string>
            {
                { "SUMMARY", cvData.Summary },
                { "EXPERIENCE", cvData.Experience },
                { "EDUCATION", cvData.Education },
                { "SKILLS", cvData.Skills },
                { "PROJECTS", cvData.Projects },
                { "ACHIEVEMENTS", cvData.Achievements },
                { "LANGUAGES", cvData.Languages },
                { "HOBBIES", cvData.Hobbies }
            };

            foreach (var section in sections)
            {
                if (!string.IsNullOrWhiteSpace(section.Value))
                {
                    await AddSection(document, section.Key, section.Value, headerFont, normalFont);
                }
            }

            await Task.CompletedTask;
        }

        // Helper methods
        private async Task AddContactSection(Document document, CVTemplateData cvData, PdfFont headerFont, PdfFont normalFont)
        {
            var contactInfo = new List<string>();
            
            if (!string.IsNullOrWhiteSpace(cvData.Email))
                contactInfo.Add($"📧 {cvData.Email}");
            if (!string.IsNullOrWhiteSpace(cvData.PhoneNumber))
                contactInfo.Add($"📱 {cvData.PhoneNumber}");
            if (!string.IsNullOrWhiteSpace(cvData.Address))
                contactInfo.Add($"🏠 {cvData.Address}");

            if (contactInfo.Any())
            {
                var contact = new Paragraph(string.Join(" | ", contactInfo))
                    .SetFont(normalFont)
                    .SetFontSize(11)
                    .SetTextAlignment(TextAlignment.CENTER)
                    .SetMarginBottom(20);
                document.Add(contact);
            }

            await Task.CompletedTask;
        }

        private async Task AddSection(Document document, string title, string content, PdfFont headerFont, PdfFont normalFont)
        {
            var header = new Paragraph(title)
                .SetFont(headerFont)
                .SetFontSize(14)
                .SetFontColor(ColorConstants.BLUE)
                .SetMarginBottom(5)
                .SetMarginTop(15);
            document.Add(header);

            // Add underline
            var line = new Paragraph("_".PadRight(50, '_'))
                .SetFont(normalFont)
                .SetFontSize(8)
                .SetFontColor(ColorConstants.BLUE)
                .SetMarginBottom(10)
                .SetMarginTop(-5);
            document.Add(line);

            var contentPara = new Paragraph(content)
                .SetFont(normalFont)
                .SetFontSize(11)
                .SetMarginBottom(10);
            document.Add(contentPara);

            await Task.CompletedTask;
        }

        private async Task AddColoredSection(Document document, string title, string content, 
            PdfFont headerFont, PdfFont normalFont, iText.Kernel.Colors.Color color)
        {
            var header = new Paragraph(title)
                .SetFont(headerFont)
                .SetFontSize(14)
                .SetFontColor(color)
                .SetMarginBottom(5)
                .SetMarginTop(15);
            document.Add(header);

            var contentPara = new Paragraph(content)
                .SetFont(normalFont)
                .SetFontSize(11)
                .SetMarginBottom(10)
                .SetBorderLeft(new iText.Layout.Borders.SolidBorder(color, 3))
                .SetPaddingLeft(10);
            document.Add(contentPara);

            await Task.CompletedTask;
        }

        private async Task AddContactToCell(Cell cell, CVTemplateData cvData, PdfFont headerFont, PdfFont normalFont)
        {
            await AddSectionToCell(cell, "CONTACT", 
                $"{cvData.Email}\n{cvData.PhoneNumber}\n{cvData.Address}".Trim(), 
                headerFont, normalFont);
        }

        private async Task AddSectionToCell(Cell cell, string title, string content, PdfFont headerFont, PdfFont normalFont)
        {
            if (string.IsNullOrWhiteSpace(content)) return;

            var header = new Paragraph(title)
                .SetFont(headerFont)
                .SetFontSize(12)
                .SetMarginBottom(5)
                .SetMarginTop(15);
            cell.Add(header);

            var contentPara = new Paragraph(content)
                .SetFont(normalFont)
                .SetFontSize(10)
                .SetMarginBottom(10);
            cell.Add(contentPara);

            await Task.CompletedTask;
        }

        // Rest of the existing methods remain the same...
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

            return await Task.FromResult((errors.Count == 0, errors));
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

        private string GetTemplateDisplayName(string fileName)
        {
            return fileName switch
            {
                "theme1" => "Modern Professional",
                "theme2" => "Classic Corporate", 
                "theme3" => "Creative Designer",
                "theme4" => "Minimalist Clean",
                "theme5" => "Executive Premium",
                "theme6" => "Tech Specialist",
                "theme7" => "Academic Scholar",
                "theme8" => "Business Elegant",
                "theme9" => "Startup Dynamic",
                _ => $"Template {fileName}"
            };
        }

        private string GetTemplateDescription(string fileName)
        {
            return fileName switch
            {
                "theme1" => "Modern design suitable for tech professionals",
                "theme2" => "Traditional layout perfect for corporate roles",
                "theme3" => "Creative layout ideal for designers and artists",
                "theme4" => "Clean and minimal for any industry",
                "theme5" => "Premium design for executive positions",
                "theme6" => "Tech-focused layout with modern elements",
                "theme7" => "Academic style perfect for research roles",
                "theme8" => "Business-focused elegant design",
                "theme9" => "Dynamic layout for startup environments",
                _ => $"Professional CV template {fileName}"
            };
        }

        private CVTemplateStyle GetTemplateStyle(string fileName)
        {
            // Return default style - this won't be used in PDF generation
            return new CVTemplateStyle
            {
                FontFamily = "Arial",
                BaseFontSize = 12,
                PrimaryColor = "#333333",
                SecondaryColor = "#666666"
            };
        }
    }
}