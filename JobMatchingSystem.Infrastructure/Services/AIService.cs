using JobMatchingSystem.Infrastructure.IServices;
using JobMatchingSystem.Infrastructure.Models;
using JobMatchingSystem.Infrastructure.Configuration;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using System.Text;
using System.Text.Json;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas.Parser;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System.Drawing;

namespace JobMatchingSystem.Infrastructure.Services
{
    public class AIService : IAIService
    {
        private readonly HttpClient _httpClient;
        private readonly AISettings _aiSettings;
        private readonly JsonSerializerOptions _jsonOptions;

        public AIService(HttpClient httpClient, IOptions<AISettings> aiSettings)
        {
            _httpClient = httpClient;
            _aiSettings = aiSettings.Value;
            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            };

            _httpClient.Timeout = TimeSpan.FromSeconds(_aiSettings.TimeoutSeconds);
        }

        public async Task<CVAnalysisResult> AnalyzeCVFromPDFAsync(IFormFile pdfFile)
        {
            if (pdfFile == null || pdfFile.Length == 0)
                throw new ArgumentException("File PDF không hợp lệ");

            // Trích xuất text từ PDF
            var cvText = await ExtractTextFromPDFAsync(pdfFile);
            
            // Phân tích text bằng AI
            return await AnalyzeCVFromTextAsync(cvText);
        }

        public Task<string> ExtractTextFromPDFAsync(IFormFile pdfFile)
        {
            try
            {
                using var stream = pdfFile.OpenReadStream();
                using var pdfReader = new PdfReader(stream);
                using var pdfDocument = new PdfDocument(pdfReader);
                
                var text = new StringBuilder();
                
                for (int i = 1; i <= pdfDocument.GetNumberOfPages(); i++)
                {
                    var page = pdfDocument.GetPage(i);
                    var pageText = PdfTextExtractor.GetTextFromPage(page);
                    text.AppendLine(pageText);
                }
                
                return Task.FromResult(text.ToString());
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi trích xuất text từ PDF: {ex.Message}");
            }
        }

        public async Task<CVAnalysisResult> AnalyzeCVFromTextAsync(string cvText)
        {
            if (string.IsNullOrWhiteSpace(cvText))
                throw new ArgumentException("Nội dung CV không được để trống");

            if (!_aiSettings.EnableAI)
            {
                return new CVAnalysisResult
                {
                    OriginalText = cvText,
                    FullName = "AI chưa được kích hoạt - EnableAI = false"
                };
            }

            try
            {
                // Log bước 1: Tạo prompt
                var prompt = CreateCVAnalysisPrompt(cvText);
                
                // Log bước 2: Gọi AI
                var aiResponse = await CallOllamaAPIAsync(prompt);
                
                if (string.IsNullOrWhiteSpace(aiResponse))
                {
                    throw new Exception("AI trả về response rỗng");
                }
                
                // Log bước 3: Parse response
                return ParseAIResponse(aiResponse, cvText);
            }
            catch (Exception ex)
            {
                // Fallback: trả về kết quả cơ bản với thông tin debug
                return new CVAnalysisResult
                {
                    OriginalText = cvText,
                    FullName = $"DEBUG - Lỗi AI: {ex.Message}",
                    Skills = new List<string> 
                    { 
                        $"AI Settings: EnableAI={_aiSettings.EnableAI}", 
                        $"Model: {_aiSettings.DefaultModel}",
                        $"URL: {_aiSettings.OllamaBaseUrl}",
                        $"Error: {ex.GetType().Name}"
                    }
                };
            }
        }

        public Task<byte[]> ExportCVAnalysisToExcelAsync(List<CVAnalysisResult> analysisResults)
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            
            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("CV Analysis Results");

            // Tạo header
            var headers = new[]
            {
                "STT", "Họ tên", "Năm sinh", "Giới tính", "Email", "Số điện thoại", 
                "Địa chỉ", "Học vấn", "Kỹ năng", "Kinh nghiệm", "Thành tựu", "Dự án"
            };

            for (int i = 0; i < headers.Length; i++)
            {
                worksheet.Cells[1, i + 1].Value = headers[i];
                worksheet.Cells[1, i + 1].Style.Font.Bold = true;
                worksheet.Cells[1, i + 1].Style.Fill.PatternType = ExcelFillStyle.Solid;
                worksheet.Cells[1, i + 1].Style.Fill.BackgroundColor.SetColor(Color.LightBlue);
            }

            // Điền dữ liệu
            for (int row = 0; row < analysisResults.Count; row++)
            {
                var result = analysisResults[row];
                var currentRow = row + 2;

                worksheet.Cells[currentRow, 1].Value = row + 1;
                worksheet.Cells[currentRow, 2].Value = result.FullName ?? "";
                worksheet.Cells[currentRow, 3].Value = result.BirthYear ?? "";
                worksheet.Cells[currentRow, 4].Value = result.Gender ?? "";
                worksheet.Cells[currentRow, 5].Value = result.Email ?? "";
                worksheet.Cells[currentRow, 6].Value = result.PhoneNumber ?? "";
                worksheet.Cells[currentRow, 7].Value = result.Address ?? "";
                
                // Học vấn
                var education = result.Education.Any() 
                    ? string.Join("; ", result.Education.Select(e => 
                        $"{e.Degree} - {e.Institution} ({e.GraduationYear})"))
                    : "";
                worksheet.Cells[currentRow, 8].Value = education;
                
                // Kỹ năng
                worksheet.Cells[currentRow, 9].Value = string.Join(", ", result.Skills);
                
                // Kinh nghiệm
                var experience = result.Experience.Any()
                    ? string.Join("; ", result.Experience.Select(e => 
                        $"{e.Position} tại {e.Company} ({e.StartDate} - {e.EndDate})"))
                    : "";
                worksheet.Cells[currentRow, 10].Value = experience;
                
                // Thành tựu
                worksheet.Cells[currentRow, 11].Value = string.Join("; ", result.Achievements);
                
                // Dự án
                var projects = result.Projects.Any()
                    ? string.Join("; ", result.Projects.Select(p => 
                        $"{p.ProjectName} - {p.Role}"))
                    : "";
                worksheet.Cells[currentRow, 12].Value = projects;
            }

            // Tự động điều chỉnh độ rộng cột
            worksheet.Cells.AutoFitColumns();

            return Task.FromResult(package.GetAsByteArray());
        }

        private string CreateCVAnalysisPrompt(string cvText)
        {
            return $@"
Analyze the following CV and return ONLY a JSON response with this exact structure:

{{
    ""fullName"": ""Full name of candidate"",
    ""birthYear"": ""Birth year only"",
    ""email"": ""Email address"",
    ""skills"": [""Skill1"", ""Skill2"", ""Skill3""],
    ""education"": [{{""institution"": ""School name"", ""degree"": ""Degree""}}]
}}

Return ONLY JSON, no explanations.

CV Content:
{cvText}
";
        }

        private async Task<string> CallOllamaAPIAsync(string prompt)
        {
            try
            {
                var request = new AIRequest
                {
                    Model = _aiSettings.DefaultModel,
                    Prompt = prompt,
                    Stream = false
                };

                var jsonContent = JsonSerializer.Serialize(request, _jsonOptions);
                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync($"{_aiSettings.OllamaBaseUrl}/api/generate", content);
                
                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    var aiResponse = JsonSerializer.Deserialize<AIResponse>(responseContent, _jsonOptions);
                    return aiResponse?.Response ?? "";
                }
                else
                {
                    throw new Exception($"Lỗi API AI: {response.StatusCode} - {response.ReasonPhrase}");
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi gọi AI API: {ex.Message}");
            }
        }

        private CVAnalysisResult ParseAIResponse(string aiResponse, string originalText)
        {
            try
            {
                // Log raw AI response for debugging
                if (string.IsNullOrWhiteSpace(aiResponse))
                {
                    throw new Exception("AI response is empty");
                }

                // Loại bỏ markdown code blocks nếu có
                var cleanedResponse = aiResponse.Trim();
                if (cleanedResponse.StartsWith("```json"))
                {
                    cleanedResponse = cleanedResponse.Substring(7);
                }
                if (cleanedResponse.StartsWith("```"))
                {
                    cleanedResponse = cleanedResponse.Substring(3);
                }
                if (cleanedResponse.EndsWith("```"))
                {
                    cleanedResponse = cleanedResponse.Substring(0, cleanedResponse.Length - 3);
                }

                // Tìm JSON trong response
                var jsonStart = cleanedResponse.IndexOf('{');
                var jsonEnd = cleanedResponse.LastIndexOf('}');
                
                if (jsonStart >= 0 && jsonEnd > jsonStart)
                {
                    cleanedResponse = cleanedResponse.Substring(jsonStart, jsonEnd - jsonStart + 1);
                }

                var result = JsonSerializer.Deserialize<CVAnalysisResult>(cleanedResponse, _jsonOptions);
                if (result != null)
                {
                    result.OriginalText = originalText;
                    return result;
                }
            }
            catch (JsonException ex)
            {
                // Debug JSON parsing error
                return new CVAnalysisResult
                {
                    OriginalText = originalText,
                    FullName = $"JSON Parse Error: {ex.Message}",
                    Skills = new List<string> { $"Raw AI Response: {aiResponse.Substring(0, Math.Min(200, aiResponse.Length))}" }
                };
            }
            catch (Exception ex)
            {
                // Debug other errors
                return new CVAnalysisResult
                {
                    OriginalText = originalText,
                    FullName = $"Parse Error: {ex.Message}",
                    Skills = new List<string> { $"AI Response Length: {aiResponse?.Length ?? 0}" }
                };
            }

            // Fallback: tạo kết quả cơ bản từ AI response
            return new CVAnalysisResult
            {
                OriginalText = originalText,
                FullName = "Fallback - Không thể parse AI response",
                Skills = new List<string> { aiResponse?.Substring(0, Math.Min(100, aiResponse?.Length ?? 0)) + "..." }
            };
        }
    }
}