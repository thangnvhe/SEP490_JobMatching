using JobMatchingSystem.Infrastructure.Services;
using JobMatchingSystem.Infrastructure.IServices;
using JobMatchingSystem.Infrastructure.Configuration;
using JobMatchingSystem.Infrastructure.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace JobMatchingSystem.UnitTest
{
    public class AIServiceTests
    {
        private readonly AIService _aiService;

        public AIServiceTests()
        {
            var mockAISettings = new Mock<IOptions<AISettings>>();
            
            var aiSettings = new AISettings
            {
                OllamaBaseUrl = "http://localhost:11434",
                DefaultModel = "llama3.1",
                TimeoutSeconds = 300,
                EnableAI = false // Disable AI for testing
            };
            
            mockAISettings.Setup(x => x.Value).Returns(aiSettings);
            
            // Create real HttpClient for testing (but AI is disabled)
            var httpClient = new System.Net.Http.HttpClient();
            _aiService = new AIService(httpClient, mockAISettings.Object);
        }

        [Fact]
        public async System.Threading.Tasks.Task AnalyzeCVFromTextAsync_WithEmptyText_ThrowsException()
        {
            // Arrange
            var emptyText = "";

            // Act & Assert
            await Assert.ThrowsAsync<System.ArgumentException>(() => _aiService.AnalyzeCVFromTextAsync(emptyText));
        }

        [Fact]
        public async System.Threading.Tasks.Task AnalyzeCVFromTextAsync_WithValidText_ReturnsResult()
        {
            // Arrange
            var cvText = @"
                Nguyễn Văn Thắng
                Năm sinh: 1999
                Email: thang@example.com
                Kỹ năng: C#, .NET, SQL Server
                Kinh nghiệm: Developer tại ABC Company
            ";

            // Act
            var result = await _aiService.AnalyzeCVFromTextAsync(cvText);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(cvText, result.OriginalText);
            Assert.NotNull(result.FullName);
        }

        [Fact]
        public async System.Threading.Tasks.Task ExportCVAnalysisToExcelAsync_WithValidData_ReturnsExcelBytes()
        {
            // Arrange
            var analysisResults = new System.Collections.Generic.List<CVAnalysisResult>
            {
                new CVAnalysisResult
                {
                    FullName = "Nguyễn Văn Thắng",
                    BirthYear = "1999",
                    Gender = "Nam",
                    Email = "thang@example.com",
                    Skills = new System.Collections.Generic.List<string> { "C#", ".NET", "SQL Server" }
                }
            };

            // Act
            var excelBytes = await _aiService.ExportCVAnalysisToExcelAsync(analysisResults);

            // Assert
            Assert.NotNull(excelBytes);
            Assert.True(excelBytes.Length > 0);
        }

        [Fact]
        public async System.Threading.Tasks.Task ExportCVAnalysisToExcelAsync_WithEmptyList_ReturnsExcelBytes()
        {
            // Arrange
            var emptyList = new System.Collections.Generic.List<CVAnalysisResult>();

            // Act
            var excelBytes = await _aiService.ExportCVAnalysisToExcelAsync(emptyList);

            // Assert
            Assert.NotNull(excelBytes);
            Assert.True(excelBytes.Length > 0); // Should still create Excel with headers
        }
    }
}