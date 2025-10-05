using System.IO;
using System.Threading.Tasks;
using JobMatchingSystem.Application.DTOs;
using JobMatchingSystem.Infrastructure.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Moq;
using Xunit;

namespace JobMatchingSystem.UnitTest
{
    public class PDFServiceTests
    {
        [Fact]
        public async Task UploadCVAsync_ShouldRejectIfTooLarge()
        {
            // Arrange
            var mockEnv = new Mock<IWebHostEnvironment>();
            string webRoot = Path.Combine(Path.GetTempPath(), "pdftest_webroot_large");
            if (Directory.Exists(webRoot)) Directory.Delete(webRoot, true);
            Directory.CreateDirectory(webRoot);
            mockEnv.Setup(e => e.WebRootPath).Returns(webRoot);

            var service = new PDFService(mockEnv.Object);

            // Create a fake PDF file larger than 5MB
            var bigData = new byte[6 * 1024 * 1024];
            var stream = new MemoryStream(bigData);
            var formFile = new FormFile(stream, 0, bigData.Length, "file", "big.pdf");

            // Act
            var result = await service.UploadCVAsync(formFile, "cvs");

            // Assert
            Assert.False(result.Success);
            Assert.Contains("less than 5 MB", result.Message);

            // Cleanup
            if (Directory.Exists(webRoot)) Directory.Delete(webRoot, true);
        }

        [Fact]
        public async Task UploadCVAsync_ShouldRejectIfNotPDF()
        {
            // Arrange
            var mockEnv = new Mock<IWebHostEnvironment>();
            string webRoot = Path.Combine(Path.GetTempPath(), "pdftest_webroot_notpdf");
            if (Directory.Exists(webRoot)) Directory.Delete(webRoot, true);
            Directory.CreateDirectory(webRoot);
            mockEnv.Setup(e => e.WebRootPath).Returns(webRoot);

            var service = new PDFService(mockEnv.Object);

            var data = new byte[100];
            var stream = new MemoryStream(data);
            stream.Position = 0;
            var formFile = new FormFile(stream, 0, data.Length, "file", "document.docx");

            // Act
            var result = await service.UploadCVAsync(formFile, "cvs");

            // Assert
            Assert.False(result.Success);
            Assert.Contains("Only PDF files are allowed", result.Message);

            // Cleanup
            if (Directory.Exists(webRoot)) Directory.Delete(webRoot, true);
        }

        [Fact]
        public async Task UploadCVAsync_ShouldSucceedWithValidPDF()
        {
            // Arrange
            var mockEnv = new Mock<IWebHostEnvironment>();
            string webRoot = Path.Combine(Path.GetTempPath(), "pdftest_webroot_valid");
            if (Directory.Exists(webRoot)) Directory.Delete(webRoot, true);
            Directory.CreateDirectory(webRoot);
            mockEnv.Setup(e => e.WebRootPath).Returns(webRoot);

            var service = new PDFService(mockEnv.Object);

            // Create a small valid PDF file
            var pdfData = new byte[1024]; // 1KB
            var stream = new MemoryStream(pdfData);
            stream.Position = 0;
            var formFile = new FormFile(stream, 0, pdfData.Length, "file", "cv.pdf");

            // Act
            var result = await service.UploadCVAsync(formFile, "cvs", "testcv");

            // Assert
            Assert.True(result.Success);
            Assert.Contains("uploaded successfully", result.Message);

            // Verify file exists
            string expectedPath = Path.Combine(webRoot, "cvs", "testcv.pdf");
            Assert.True(File.Exists(expectedPath));

            // Cleanup
            if (Directory.Exists(webRoot)) Directory.Delete(webRoot, true);
        }

        [Fact]
        public async Task DownloadCVAsync_ShouldReturnFileBytes_WhenExists()
        {
            // Arrange
            var mockEnv = new Mock<IWebHostEnvironment>();
            string webRoot = Path.Combine(Path.GetTempPath(), "pdftest_webroot_download");
            if (Directory.Exists(webRoot)) Directory.Delete(webRoot, true);
            Directory.CreateDirectory(webRoot);
            mockEnv.Setup(e => e.WebRootPath).Returns(webRoot);

            string cvsDir = Path.Combine(webRoot, "cvs");
            Directory.CreateDirectory(cvsDir);
            string fileName = "testcv.pdf";
            string fullPath = Path.Combine(cvsDir, fileName);
            var testData = new byte[] { 1, 2, 3, 4, 5 };
            File.WriteAllBytes(fullPath, testData);

            var service = new PDFService(mockEnv.Object);

            // Act
            var result = await service.DownloadCVAsync("cvs", fileName);

            // Assert
            Assert.True(result.Success);
            Assert.NotNull(result.Data);
            Assert.Equal(testData, result.Data);

            // Cleanup
            if (Directory.Exists(webRoot)) Directory.Delete(webRoot, true);
        }

        [Fact]
        public async Task DownloadCVAsync_ShouldReturnNotFound_WhenMissing()
        {
            var mockEnv = new Mock<IWebHostEnvironment>();
            string webRoot = Path.Combine(Path.GetTempPath(), "pdftest_webroot_notfound");
            if (Directory.Exists(webRoot)) Directory.Delete(webRoot, true);
            Directory.CreateDirectory(webRoot);
            mockEnv.Setup(e => e.WebRootPath).Returns(webRoot);

            var service = new PDFService(mockEnv.Object);

            var result = await service.DownloadCVAsync("cvs", "nonexistent.pdf");

            Assert.False(result.Success);
            Assert.Contains("not found", result.Message.ToLower());

            // Cleanup
            if (Directory.Exists(webRoot)) Directory.Delete(webRoot, true);
        }

        [Fact]
        public async Task DeleteCVAsync_ShouldDeleteExistingFile_OnDisk()
        {
            // Arrange
            var mockEnv = new Mock<IWebHostEnvironment>();
            string webRoot = Path.Combine(Path.GetTempPath(), "pdftest_webroot_deletecv");
            if (Directory.Exists(webRoot)) Directory.Delete(webRoot, true);
            Directory.CreateDirectory(webRoot);
            mockEnv.Setup(e => e.WebRootPath).Returns(webRoot);

            string cvsDir = Path.Combine(webRoot, "cvs");
            Directory.CreateDirectory(cvsDir);
            string fileName = "todelete.pdf";
            string fullPath = Path.Combine(cvsDir, fileName);
            File.WriteAllBytes(fullPath, new byte[] { 1, 2, 3 });

            Assert.True(File.Exists(fullPath));

            var service = new PDFService(mockEnv.Object);

            // Act
            var result = await service.DeleteCVAsync("cvs", fileName);

            // Assert
            Assert.True(result.Success);
            Assert.False(File.Exists(fullPath));

            // Cleanup
            if (Directory.Exists(webRoot)) Directory.Delete(webRoot, true);
        }
    }
}
