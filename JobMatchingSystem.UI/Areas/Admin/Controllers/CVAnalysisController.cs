using JobMatchingSystem.Infrastructure.IServices;
using JobMatchingSystem.Infrastructure.Models;
using Microsoft.AspNetCore.Mvc;

namespace JobMatchingSystem.UI.Areas.Admin.Controllers
{
    [Area("Admin")]
    public class CVAnalysisController : Controller
    {
        private readonly IAIService _aiService;

        public CVAnalysisController(IAIService aiService)
        {
            _aiService = aiService;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> AnalyzePDF(IFormFile pdfFile)
        {
            if (pdfFile == null || pdfFile.Length == 0)
            {
                TempData["Error"] = "Vui lòng chọn file PDF hợp lệ";
                return RedirectToAction("Index");
            }

            try
            {
                var result = await _aiService.AnalyzeCVFromPDFAsync(pdfFile);
                return View("AnalysisResult", result);
            }
            catch (Exception ex)
            {
                TempData["Error"] = "Lỗi khi phân tích CV: " + ex.Message;
                return RedirectToAction("Index");
            }
        }

        [HttpPost]
        public async Task<IActionResult> ExportToExcel(List<CVAnalysisResult> results)
        {
            try
            {
                var excelBytes = await _aiService.ExportCVAnalysisToExcelAsync(results ?? new List<CVAnalysisResult>());
                var fileName = $"CV_Analysis_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
                
                return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                TempData["Error"] = "Lỗi khi xuất Excel: " + ex.Message;
                return RedirectToAction("Index");
            }
        }

        [HttpPost]
        public async Task<IActionResult> BatchAnalyze(List<IFormFile> pdfFiles)
        {
            if (pdfFiles == null || !pdfFiles.Any())
            {
                TempData["Error"] = "Vui lòng chọn ít nhất một file PDF";
                return RedirectToAction("Index");
            }

            var results = new List<CVAnalysisResult>();

            foreach (var file in pdfFiles)
            {
                if (file.Length > 0)
                {
                    try
                    {
                        var result = await _aiService.AnalyzeCVFromPDFAsync(file);
                        results.Add(result);
                    }
                    catch (Exception ex)
                    {
                        // Log error but continue with other files
                        var errorResult = new CVAnalysisResult
                        {
                            FullName = $"Lỗi phân tích file {file.FileName}: {ex.Message}"
                        };
                        results.Add(errorResult);
                    }
                }
            }

            return View("BatchAnalysisResults", results);
        }

        [HttpGet]
        public async Task<IActionResult> DownloadSampleExcel()
        {
            // Create sample data for demonstration
            var sampleResults = new List<CVAnalysisResult>
            {
                new CVAnalysisResult
                {
                    FullName = "Nguyễn Văn Thắng",
                    BirthYear = "1999",
                    Gender = "Nam",
                    Email = "thang@example.com",
                    PhoneNumber = "0123456789",
                    Address = "Hà Nội",
                    Skills = new List<string> { "C#", ".NET", "SQL Server", "React" },
                    Education = new List<EducationInfo>
                    {
                        new EducationInfo
                        {
                            Institution = "FPT University",
                            Degree = "Cử nhân",
                            Major = "Kỹ thuật phần mềm",
                            GraduationYear = "2021",
                            GPA = "3.5"
                        }
                    },
                    Experience = new List<ExperienceInfo>
                    {
                        new ExperienceInfo
                        {
                            Company = "ABC Company",
                            Position = "Software Developer",
                            StartDate = "01/2021",
                            EndDate = "12/2023",
                            Description = "Phát triển ứng dụng web"
                        }
                    },
                    Achievements = new List<string> { "Nhân viên xuất sắc năm 2022" },
                    Projects = new List<ProjectInfo>
                    {
                        new ProjectInfo
                        {
                            ProjectName = "E-commerce Website",
                            Description = "Website bán hàng online",
                            Technologies = "ASP.NET Core, SQL Server",
                            Role = "Full-stack Developer"
                        }
                    }
                }
            };

            var excelBytes = await _aiService.ExportCVAnalysisToExcelAsync(sampleResults);
            var fileName = $"Sample_CV_Analysis_{DateTime.Now:yyyyMMdd}.xlsx";
            
            return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }
    }
}