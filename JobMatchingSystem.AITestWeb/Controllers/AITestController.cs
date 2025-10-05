using Microsoft.AspNetCore.Mvc;
using JobMatchingSystem.Infrastructure.IServices;
using JobMatchingSystem.Infrastructure.Models;
using System.Text.Json;

namespace JobMatchingSystem.AITestWeb.Controllers
{
    public class AITestController : Controller
    {
        private readonly IAIService _aiService;
        private readonly ICVTemplateService _cvTemplateService;
        private readonly ILogger<AITestController> _logger;
        private readonly IWebHostEnvironment _hostEnvironment;

        public AITestController(IAIService aiService, ICVTemplateService cvTemplateService, ILogger<AITestController> logger, IWebHostEnvironment hostEnvironment)
        {
            _aiService = aiService;
            _cvTemplateService = cvTemplateService;
            _logger = logger;
            _hostEnvironment = hostEnvironment;
        }

        // GET: AI Test Dashboard
        public IActionResult Index()
        {
            ViewBag.Message = "🤖 AI Test Platform - JobMatching System";
            return View();
        }

        // CV Analysis from text
        public IActionResult CVAnalysis()
        {
            return View();
        }

        // PDF Analysis
        public IActionResult PDFAnalysis()
        {
            return View();
        }

        // CV Analysis from text input
        [HttpPost]
        public async Task<IActionResult> AnalyzeCVText(string cvText)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(cvText))
                {
                    ViewBag.Error = "Please enter CV text to analyze";
                    return View("CVAnalysis");
                }

                var result = await _aiService.AnalyzeCVFromTextAsync(cvText);
                
                ViewBag.Success = "CV analyzed successfully";
                ViewBag.AnalysisResult = result?.ToString() ?? "Analysis completed";
                ViewBag.InputText = cvText;
                
                return View("CVAnalysis");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing CV text");
                ViewBag.Error = $"Error analyzing CV: {ex.Message}";
                return View("CVAnalysis");
            }
        }

        // Health Check
        public async Task<IActionResult> HealthCheck()
        {
            var healthStatus = new Dictionary<string, string>();

            try
            {
                // Test AI Service
                var testCV = "John Doe - Software Developer with 5 years experience in C# and ASP.NET";
                var result = await _aiService.AnalyzeCVFromTextAsync(testCV);
                
                healthStatus["AI Service"] = result != null ? "✅ Working" : "❌ Not responding";
                healthStatus["Last Test"] = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
                healthStatus["Test Input"] = testCV;
                healthStatus["Response Type"] = result?.GetType().Name ?? "null";
                
                // Test CV Template Service
                try
                {
                    var templates = await _cvTemplateService.GetAvailableTemplatesAsync();
                    healthStatus["CV Template Service"] = templates.Any() ? $"✅ Working ({templates.Count} templates)" : "⚠️ No templates found";
                }
                catch (Exception ex)
                {
                    healthStatus["CV Template Service"] = $"❌ Error: {ex.Message}";
                }
            }
            catch (Exception ex)
            {
                healthStatus["AI Service"] = $"❌ Error: {ex.Message}";
                healthStatus["Last Test"] = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
            }

            ViewBag.HealthStatus = healthStatus;
            return View();
        }

        // API endpoint for AJAX testing
        [HttpPost]
        public async Task<JsonResult> QuickTest(string cvText)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(cvText))
                {
                    return Json(new { success = false, error = "CV text is required" });
                }

                var result = await _aiService.AnalyzeCVFromTextAsync(cvText);
                return Json(new { 
                    success = true, 
                    result = result?.ToString() ?? "Analysis completed but no result returned" 
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, error = ex.Message });
            }
        }

        // ============== CV TEMPLATE TESTING ACTIONS ==============
        
        // CV Templates List and Testing
        public async Task<IActionResult> CVTemplates()
        {
            try
            {
                var templates = await _cvTemplateService.GetAvailableTemplatesAsync();
                
                // Also load local template images for preview
                var localTemplates = GetLocalTemplateImages();
                ViewBag.LocalTemplates = localTemplates;
                ViewBag.Templates = templates;
                return View();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting CV templates");
                ViewBag.Error = $"Lỗi lấy danh sách templates: {ex.Message}";
                
                // Still try to load local templates
                var localTemplates = GetLocalTemplateImages();
                ViewBag.LocalTemplates = localTemplates;
                return View();
            }
        }
        
        private List<object> GetLocalTemplateImages()
        {
            var templates = new List<object>();
            var templatePath = Path.Combine(_hostEnvironment.WebRootPath, "TemplateCV");
            
            if (Directory.Exists(templatePath))
            {
                var imageFiles = Directory.GetFiles(templatePath, "*.png")
                    .Concat(Directory.GetFiles(templatePath, "*.jpg"))
                    .Concat(Directory.GetFiles(templatePath, "*.jpeg"))
                    .OrderBy(f => f);
                
                foreach (var file in imageFiles)
                {
                    var fileName = Path.GetFileName(file);
                    var templateId = Path.GetFileNameWithoutExtension(fileName);
                    
                    templates.Add(new {
                        TemplateId = templateId,
                        TemplateName = $"Template {templateId.Replace("theme", "")}",
                        Description = $"CV Template {templateId.Replace("theme", "")}",
                        ImageUrl = $"/TemplateCV/{fileName}",
                        FileName = fileName
                    });
                }
            }
            
            return templates;
        }

        // Generate Template (AJAX)
        [HttpPost]
        public async Task<JsonResult> GenerateTemplate([FromBody] System.Text.Json.JsonElement request)
        {
            try
            {
                if (!request.TryGetProperty("templateId", out var templateIdElement) ||
                    !request.TryGetProperty("templateData", out var templateDataElement))
                {
                    return Json(new { success = false, error = "Template ID and data are required" });
                }

                string? templateId = templateIdElement.GetString();
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                };
                var templateData = System.Text.Json.JsonSerializer.Deserialize<CVTemplateData>(templateDataElement.GetRawText(), options);

                if (string.IsNullOrEmpty(templateId) || templateData == null)
                {
                    return Json(new { success = false, error = "Invalid template ID or data" });
                }

                var result = await _cvTemplateService.GenerateCVFromTemplateAsync(templateId, templateData);
                
                if (result.Success && result.GeneratedImageBytes != null)
                {
                    // Return the PDF as base64 for preview (browsers can display PDFs)
                    var base64Pdf = Convert.ToBase64String(result.GeneratedImageBytes);
                    return Json(new { 
                        success = true, 
                        imageData = $"data:application/pdf;base64,{base64Pdf}",
                        fileName = result.FileName ?? $"CV_Template_{templateId}_{DateTime.Now:yyyyMMdd_HHmmss}.pdf",
                        isPdf = true
                    });
                }
                else
                {
                    return Json(new { success = false, error = result.ErrorMessage ?? "Failed to generate template" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating CV template");
                return Json(new { success = false, error = ex.Message });
            }
        }

        // Download Template
        [HttpPost]
        public async Task<IActionResult> DownloadTemplate(string templateId, CVTemplateData templateData)
        {
            try
            {
                var result = await _cvTemplateService.GenerateCVFromTemplateAsync(templateId, templateData);
                
                if (result.Success && result.GeneratedImageBytes != null)
                {
                    var fileName = result.FileName ?? $"CV_Template_{templateId}_{DateTime.Now:yyyyMMdd_HHmmss}.pdf";
                    return File(result.GeneratedImageBytes, "application/pdf", fileName);
                }
                else
                {
                    TempData["Error"] = result.ErrorMessage ?? "Failed to generate template";
                    return RedirectToAction("CVTemplates");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error downloading CV template");
                TempData["Error"] = $"Lỗi tạo template: {ex.Message}";
                return RedirectToAction("CVTemplates");
            }
        }

        // Quick Template Test
        public async Task<IActionResult> QuickTemplateTest()
        {
            try
            {
                var templates = await _cvTemplateService.GetAvailableTemplatesAsync();
                ViewBag.Templates = templates;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting templates for quick test");
                ViewBag.Templates = new List<CVTemplate>();
            }
            
            // Load local templates
            var localTemplates = GetLocalTemplateImages();
            ViewBag.LocalTemplates = localTemplates;
            
            return View();
        }

        // ============== PDF ANALYSIS ACTIONS ==============

        [HttpPost]
        public async Task<JsonResult> AnalyzePDFCV(IFormFile pdfFile, bool extractText = true, bool aiAnalysis = true, bool skillExtraction = true, bool scoreCV = true)
        {
            try
            {
                if (pdfFile == null || pdfFile.Length == 0)
                {
                    return Json(new { success = false, error = "No PDF file uploaded" });
                }

                if (!pdfFile.ContentType.Equals("application/pdf", StringComparison.OrdinalIgnoreCase))
                {
                    return Json(new { success = false, error = "Only PDF files are supported" });
                }

                var result = new Dictionary<string, object>
                {
                    ["fileName"] = pdfFile.FileName,
                    ["fileSize"] = $"{pdfFile.Length / 1024} KB",
                    ["uploadTime"] = DateTime.Now
                };

                // Extract text from PDF
                string? extractedText = null;
                if (extractText)
                {
                    extractedText = await ExtractTextFromPDF(pdfFile);
                    result["extractedText"] = extractedText;
                }

                // AI Analysis
                if (aiAnalysis && !string.IsNullOrEmpty(extractedText))
                {
                    try
                    {
                        var aiResult = await _aiService.AnalyzeCVFromTextAsync(extractedText);
                        result["aiAnalysis"] = aiResult?.ToString() ?? "Analysis completed";
                    }
                    catch (Exception ex)
                    {
                        result["aiAnalysis"] = $"AI Analysis failed: {ex.Message}";
                    }
                }

                // Skill Extraction
                if (skillExtraction && !string.IsNullOrEmpty(extractedText))
                {
                    var skills = ExtractSkills(extractedText);
                    result["extractedSkills"] = skills;
                }

                // CV Scoring
                if (scoreCV && !string.IsNullOrEmpty(extractedText))
                {
                    var score = CalculateCVScore(extractedText);
                    result["cvScore"] = score;
                }

                return Json(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing PDF CV");
                return Json(new { success = false, error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<JsonResult> TestSamplePDF(string sampleType)
        {
            try
            {
                var sampleText = GetSampleCVText(sampleType);
                
                var result = new Dictionary<string, object>
                {
                    ["fileName"] = $"Sample_{sampleType}_CV.pdf",
                    ["fileSize"] = "Sample",
                    ["extractedText"] = sampleText,
                    ["uploadTime"] = DateTime.Now
                };

                // AI Analysis
                try
                {
                    var aiResult = await _aiService.AnalyzeCVFromTextAsync(sampleText);
                    result["aiAnalysis"] = aiResult?.ToString() ?? "Analysis completed";
                }
                catch (Exception ex)
                {
                    result["aiAnalysis"] = $"AI Analysis failed: {ex.Message}";
                }

                // Skill Extraction
                var skills = ExtractSkills(sampleText);
                result["extractedSkills"] = skills;

                // CV Scoring
                var score = CalculateCVScore(sampleText);
                result["cvScore"] = score;

                return Json(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error testing sample PDF");
                return Json(new { success = false, error = ex.Message });
            }
        }

        public IActionResult ExportAnalysisToExcel(string data)
        {
            try
            {
                var bytes = CreateExcelReport(data);
                var fileName = $"CV_Analysis_Report_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
                return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting to Excel");
                TempData["Error"] = $"Export failed: {ex.Message}";
                return RedirectToAction("PDFAnalysis");
            }
        }

        // Helper methods
        private Task<string> ExtractTextFromPDF(IFormFile pdfFile)
        {
            try
            {
                using var stream = pdfFile.OpenReadStream();
                using var pdfReader = new iText.Kernel.Pdf.PdfReader(stream);
                using var pdfDocument = new iText.Kernel.Pdf.PdfDocument(pdfReader);
                
                var text = "";
                for (int i = 1; i <= pdfDocument.GetNumberOfPages(); i++)
                {
                    var page = pdfDocument.GetPage(i);
                    text += iText.Kernel.Pdf.Canvas.Parser.PdfTextExtractor.GetTextFromPage(page);
                }
                
                return Task.FromResult(text);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error extracting text from PDF");
                return Task.FromResult($"Error extracting text: {ex.Message}");
            }
        }

        private List<string> ExtractSkills(string text)
        {
            var skills = new List<string>();
            var commonSkills = new[] 
            {
                "C#", "Java", "Python", "JavaScript", "TypeScript", "React", "Angular", "Vue.js",
                "ASP.NET", "Node.js", "SQL Server", "MySQL", "PostgreSQL", "MongoDB",
                "Docker", "Kubernetes", "AWS", "Azure", "Git", "Agile", "Scrum",
                "HTML", "CSS", "Bootstrap", "jQuery", "REST API", "GraphQL"
            };

            foreach (var skill in commonSkills)
            {
                if (text.Contains(skill, StringComparison.OrdinalIgnoreCase))
                {
                    skills.Add(skill);
                }
            }

            return skills.Distinct().ToList();
        }

        private int CalculateCVScore(string text)
        {
            var score = 0;
            
            if (text.Length > 500) score += 20;
            if (text.Contains("experience", StringComparison.OrdinalIgnoreCase)) score += 15;
            if (text.Contains("education", StringComparison.OrdinalIgnoreCase)) score += 15;
            if (text.Contains("skills", StringComparison.OrdinalIgnoreCase)) score += 15;
            if (text.Contains("@")) score += 5;
            
            var techSkills = ExtractSkills(text);
            score += Math.Min(techSkills.Count * 2, 20);
            
            return Math.Min(score, 100);
        }

        private string GetSampleCVText(string sampleType)
        {
            return sampleType.ToLower() switch
            {
                "developer" => "John Developer - Senior Software Developer with 5+ years experience in C#, ASP.NET Core, React, JavaScript. Led development teams and delivered scalable solutions. Education: Computer Science degree. Skills: C#, JavaScript, React, SQL Server, Azure.",
                "designer" => "Sarah Designer - Senior UI/UX Designer with 4+ years experience in design systems, user research, prototyping. Created beautiful interfaces for mobile and web. Skills: Figma, Adobe Creative Suite, HTML, CSS.",
                "manager" => "Michael Manager - Senior Project Manager with 6+ years leading cross-functional teams. Expert in Agile methodologies. Delivered 95% of projects on time. Skills: Project Management, Agile, Scrum, Leadership.",
                _ => "Sample CV content for testing purposes."
            };
        }

        private byte[] CreateExcelReport(string data)
        {
            var content = $"CV Analysis Report\nGenerated: {DateTime.Now}\nData: {data}";
            return System.Text.Encoding.UTF8.GetBytes(content);
        }
    }
}