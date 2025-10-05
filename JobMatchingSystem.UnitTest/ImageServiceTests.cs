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
    public class ImageServiceTests
    {
        [Fact]
        public async Task SaveImageAsync_ShouldRejectIfTooLarge()
        {
            // Arrange
            var mockEnv = new Mock<IWebHostEnvironment>();
            string webRoot = Path.Combine(Path.GetTempPath(), "jmstest_webroot");
            Directory.CreateDirectory(webRoot);
            mockEnv.Setup(e => e.WebRootPath).Returns(webRoot);

            var service = new ImageService(mockEnv.Object);

            // Create a fake form file larger than 5MB
            var bigData = new byte[6 * 1024 * 1024];
            var stream = new MemoryStream(bigData);
            var formFile = new FormFile(stream, 0, bigData.Length, "file", "big.jpg");

            // Act
            var result = await service.SaveImageAsync(formFile, "uploads");

            // Assert
            Assert.False(result.Success);
            Assert.Contains("less than 5 MB", result.Message);
        }

        [Fact]
        public async Task DeleteImageAsync_ShouldReturnNotFound_WhenMissing()
        {
            var mockEnv = new Mock<IWebHostEnvironment>();
            string webRoot = Path.Combine(Path.GetTempPath(), "jmstest_webroot_2");
            if (Directory.Exists(webRoot)) Directory.Delete(webRoot, true);
            Directory.CreateDirectory(webRoot);
            mockEnv.Setup(e => e.WebRootPath).Returns(webRoot);

            var service = new ImageService(mockEnv.Object);

            var result = await service.DeleteImageAsync("uploads", "nonexistent.png");

            Assert.False(result.Success);
            Assert.Contains("not found", result.Message.ToLower());
        }

        [Fact]
        public async Task SaveImageAsync_ShouldRejectIfInvalidExtension()
        {
            // Arrange
            var mockEnv = new Mock<IWebHostEnvironment>();
            string webRoot = Path.Combine(Path.GetTempPath(), "jmstest_webroot_invalidext");
            Directory.CreateDirectory(webRoot);
            mockEnv.Setup(e => e.WebRootPath).Returns(webRoot);

            var service = new ImageService(mockEnv.Object);

            var data = new byte[10];
            var stream = new MemoryStream(data);
            stream.Position = 0;
            var formFile = new FormFile(stream, 0, data.Length, "file", "bad.bmp");

            // Act
            var result = await service.SaveImageAsync(formFile, "uploads");

            // Assert
            Assert.False(result.Success);
            Assert.Contains("Invalid image format", result.Message);

            // Cleanup
            if (Directory.Exists(webRoot)) Directory.Delete(webRoot, true);
        }

        [Fact]
        public async Task SaveImageAsync_ShouldRejectIfNoExtension()
        {
            // Arrange
            var mockEnv = new Mock<IWebHostEnvironment>();
            string webRoot = Path.Combine(Path.GetTempPath(), "jmstest_webroot_noext");
            Directory.CreateDirectory(webRoot);
            mockEnv.Setup(e => e.WebRootPath).Returns(webRoot);

            var service = new ImageService(mockEnv.Object);

            var data = new byte[10];
            var stream = new MemoryStream(data);
            stream.Position = 0;
            var formFile = new FormFile(stream, 0, data.Length, "file", "noext");

            // Act
            var result = await service.SaveImageAsync(formFile, "uploads");

            // Assert
            Assert.False(result.Success);
            Assert.Contains("has no extension", result.Message);

            // Cleanup
            if (Directory.Exists(webRoot)) Directory.Delete(webRoot, true);
        }

        [Fact]
        public async Task DeleteImageAsync_ShouldDeleteExistingFile_OnDisk()
        {
            // Arrange
            var mockEnv = new Mock<IWebHostEnvironment>();
            string webRoot = Path.Combine(Path.GetTempPath(), "jmstest_webroot_delete");
            if (Directory.Exists(webRoot)) Directory.Delete(webRoot, true);
            Directory.CreateDirectory(webRoot);
            mockEnv.Setup(e => e.WebRootPath).Returns(webRoot);

            string uploads = Path.Combine(webRoot, "uploads");
            Directory.CreateDirectory(uploads);
            string fileName = "todelete.png";
            string fullPath = Path.Combine(uploads, fileName);
            File.WriteAllBytes(fullPath, new byte[] { 1, 2, 3 });

            Assert.True(File.Exists(fullPath));

            var service = new ImageService(mockEnv.Object);

            // Act
            var result = await service.DeleteImageAsync("uploads", fileName);

            // Assert
            Assert.True(result.Success);
            Assert.False(File.Exists(fullPath));

            // Cleanup
            if (Directory.Exists(webRoot)) Directory.Delete(webRoot, true);
        }
    }
}
