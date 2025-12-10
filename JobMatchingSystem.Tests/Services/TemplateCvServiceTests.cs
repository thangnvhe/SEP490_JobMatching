using FluentAssertions;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Implementations;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using Moq;
using System.Net;
using Xunit;

namespace JobMatchingSystem.Tests.Services
{
    public class TemplateCvServiceTests : IDisposable
    {
        private readonly Mock<ITemplateCvRepository> _mockRepository;
        private readonly Mock<IWebHostEnvironment> _mockWebHostEnvironment;
        private readonly Mock<IBlobStorageService> _mockBlobStorageService;
        private readonly TemplateCvService _service;

        public TemplateCvServiceTests()
        {
            _mockRepository = new Mock<ITemplateCvRepository>();
            _mockWebHostEnvironment = new Mock<IWebHostEnvironment>();
            _mockBlobStorageService = new Mock<IBlobStorageService>();
            _service = new TemplateCvService(_mockRepository.Object, _mockWebHostEnvironment.Object, _mockBlobStorageService.Object);
        }

        #region CreateTemplateAsync Tests

        [Fact]
        public async Task CreateTemplateAsync_ValidRequest_ShouldCreateTemplate()
        {
            // Arrange
            var request = new CreateTemplateCvRequest
            {
                Name = "Test Template",
                File = CreateMockFile("test.html", "text/html")
            };

            _mockBlobStorageService
                .Setup(x => x.UploadFileAsync(It.IsAny<IFormFile>(), It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync("https://blob.storage.url/template-cvs/test.html");

            _mockRepository
                .Setup(x => x.CreateAsync(It.IsAny<TemplateCV>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _service.CreateTemplateAsync(request);

            // Assert
            result.Should().NotBeNull();
            result.IsSuccess.Should().BeTrue();
            result.StatusCode.Should().Be(HttpStatusCode.Created);
            result.Result.Should().NotBeNull();
            result.Result!.Name.Should().Be("Test Template");
            
            _mockBlobStorageService.Verify(x => x.UploadFileAsync(request.File, "template-cvs", It.IsAny<string>()), Times.Once);
            _mockRepository.Verify(x => x.CreateAsync(It.Is<TemplateCV>(t => t.Name == "Test Template")), Times.Once);
        }

        [Fact]
        public async Task CreateTemplateAsync_NullRequest_ShouldReturnBadRequest()
        {
            // Act
            var result = await _service.CreateTemplateAsync(null!);

            // Assert
            result.Should().NotBeNull();
            result.IsSuccess.Should().BeFalse();
            result.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            result.ErrorMessages?.FirstOrDefault().Should().Contain("Request không được để trống");
        }

        [Fact]
        public async Task CreateTemplateAsync_NullFile_ShouldReturnBadRequest()
        {
            // Arrange
            var request = new CreateTemplateCvRequest
            {
                Name = "Test Template",
                File = null!
            };

            // Act
            var result = await _service.CreateTemplateAsync(request);

            // Assert
            result.Should().NotBeNull();
            result.IsSuccess.Should().BeFalse();
            result.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            result.ErrorMessages?.FirstOrDefault().Should().Contain("File không hợp lệ hoặc không tồn tại");
        }

        [Fact]
        public async Task CreateTemplateAsync_InvalidFileType_ShouldReturnBadRequest()
        {
            // Arrange
            var request = new CreateTemplateCvRequest
            {
                Name = "Test Template",
                File = CreateMockFile("test.txt", "text/plain")
            };

            // Act
            var result = await _service.CreateTemplateAsync(request);

            // Assert
            result.Should().NotBeNull();
            result.IsSuccess.Should().BeFalse();
            result.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            result.ErrorMessages?.FirstOrDefault().Should().Contain("Chỉ chấp nhận file HTML");
        }

        [Fact]
        public async Task CreateTemplateAsync_WithImageFile_ShouldCreateTemplateWithImage()
        {
            // Arrange
            var request = new CreateTemplateCvRequest
            {
                Name = "Test Template",
                File = CreateMockFile("test.html", "text/html"),
                ImageFile = CreateMockFile("preview.jpg", "image/jpeg")
            };

            _mockBlobStorageService
                .Setup(x => x.UploadFileAsync(request.File, "template-cvs", It.IsAny<string>()))
                .ReturnsAsync("https://blob.storage.url/template-cvs/test.html");

            _mockBlobStorageService
                .Setup(x => x.UploadFileAsync(request.ImageFile, "template-cv-images", It.IsAny<string>()))
                .ReturnsAsync("https://blob.storage.url/template-cv-images/preview.jpg");

            _mockRepository
                .Setup(x => x.CreateAsync(It.IsAny<TemplateCV>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _service.CreateTemplateAsync(request);

            // Assert
            result.Should().NotBeNull();
            result.IsSuccess.Should().BeTrue();
            result.Result!.ImageUrl.Should().NotBeNull();
        }

        #endregion

        #region GetAllAsync Tests

        [Fact]
        public async Task GetAllAsync_ValidParameters_ShouldReturnPagedResult()
        {
            // Arrange
            var templates = new List<TemplateCV>
            {
                new TemplateCV { Id = 1, Name = "Template 1", PathUrl = "https://blob.url/template1.html" },
                new TemplateCV { Id = 2, Name = "Template 2", PathUrl = "https://blob.url/template2.html" }
            };

            _mockRepository
                .Setup(x => x.GetAllAsync())
                .ReturnsAsync(templates);

            // Act
            var result = await _service.GetAllAsync(1, 10, "name", false);

            // Assert
            result.Should().NotBeNull();
            result.IsSuccess.Should().BeTrue();
            result.StatusCode.Should().Be(HttpStatusCode.OK);
            result.Result.Should().NotBeNull();
            result.Result!.Items.Should().HaveCount(2);
            
            _mockRepository.Verify(x => x.GetAllAsync(), Times.Once);
        }

        [Fact]
        public async Task GetAllAsync_EmptyResult_ShouldReturnEmptyPagedResult()
        {
            // Arrange
            var emptyList = new List<TemplateCV>();

            _mockRepository
                .Setup(x => x.GetAllAsync())
                .ReturnsAsync(emptyList);

            // Act
            var result = await _service.GetAllAsync(1, 10, "", false);

            // Assert
            result.Should().NotBeNull();
            result.IsSuccess.Should().BeTrue();
            result.Result!.Items.Should().BeEmpty();
        }

        [Fact]
        public async Task GetAllAsync_SortByName_ShouldReturnSortedResult()
        {
            // Arrange
            var templates = new List<TemplateCV>
            {
                new TemplateCV { Id = 1, Name = "Z Template", PathUrl = "https://blob.url/template1.html" },
                new TemplateCV { Id = 2, Name = "A Template", PathUrl = "https://blob.url/template2.html" }
            };

            _mockRepository
                .Setup(x => x.GetAllAsync())
                .ReturnsAsync(templates);

            // Act
            var result = await _service.GetAllAsync(1, 10, "name", false);

            // Assert
            result.Should().NotBeNull();
            result.IsSuccess.Should().BeTrue();
            result.Result!.Items.First().Name.Should().Be("A Template");
        }

        #endregion

        #region GetByIdAsync Tests

        [Fact]
        public async Task GetByIdAsync_ValidId_ShouldReturnTemplate()
        {
            // Arrange
            var template = new TemplateCV
            {
                Id = 1,
                Name = "Test Template",
                PathUrl = "https://blob.url/template1.html"
            };

            _mockRepository
                .Setup(x => x.GetByIdAsync(1))
                .ReturnsAsync(template);

            // Act
            var result = await _service.GetByIdAsync(1);

            // Assert
            result.Should().NotBeNull();
            result.IsSuccess.Should().BeTrue();
            result.StatusCode.Should().Be(HttpStatusCode.OK);
            result.Result.Should().NotBeNull();
            result.Result!.Name.Should().Be("Test Template");
            
            _mockRepository.Verify(x => x.GetByIdAsync(1), Times.Once);
        }

        [Fact]
        public async Task GetByIdAsync_InvalidId_ShouldReturnNotFound()
        {
            // Arrange
            _mockRepository
                .Setup(x => x.GetByIdAsync(999))
                .ReturnsAsync((TemplateCV?)null);

            // Act
            var result = await _service.GetByIdAsync(999);

            // Assert
            result.Should().NotBeNull();
            result.IsSuccess.Should().BeFalse();
            result.StatusCode.Should().Be(HttpStatusCode.NotFound);
            result.ErrorMessages?.FirstOrDefault().Should().Contain("Không tìm thấy template CV");
        }

        [Theory]
        [InlineData(0)]
        [InlineData(-1)]
        public async Task GetByIdAsync_InvalidIdValues_ShouldReturnBadRequest(int invalidId)
        {
            // Act
            var result = await _service.GetByIdAsync(invalidId);

            // Assert
            result.Should().NotBeNull();
            result.IsSuccess.Should().BeFalse();
            result.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            result.ErrorMessages?.FirstOrDefault().Should().Contain("ID không hợp lệ");
        }

        #endregion

        #region DeleteAsync Tests

        [Fact]
        public async Task DeleteAsync_ValidId_ShouldDeleteTemplate()
        {
            // Arrange
            var template = new TemplateCV
            {
                Id = 1,
                Name = "Test Template",
                PathUrl = "https://blob.url/template1.html"
            };

            _mockRepository
                .Setup(x => x.GetByIdAsync(1))
                .ReturnsAsync(template);

            _mockRepository
                .Setup(x => x.DeleteAsync(It.IsAny<TemplateCV>()))
                .Callback<TemplateCV>(t => { /* Mock delete operation */ });

            _mockBlobStorageService
                .Setup(x => x.DeleteFileAsync(It.IsAny<string>()))
                .ReturnsAsync(true);

            // Act
            var result = await _service.DeleteAsync(1);

            // Assert
            result.Should().NotBeNull();
            result.IsSuccess.Should().BeTrue();
            result.StatusCode.Should().Be(HttpStatusCode.OK);
            result.ErrorMessages?.FirstOrDefault().Should().Contain("Xóa template CV thành công");
            
            _mockRepository.Verify(x => x.GetByIdAsync(1), Times.Once);
            _mockBlobStorageService.Verify(x => x.DeleteFileAsync(template.PathUrl!), Times.Once);
            _mockRepository.Verify(x => x.DeleteAsync(template), Times.Once);
        }

        [Fact]
        public async Task DeleteAsync_TemplateNotFound_ShouldReturnNotFound()
        {
            // Arrange
            _mockRepository
                .Setup(x => x.GetByIdAsync(999))
                .ReturnsAsync((TemplateCV?)null);

            // Act
            var result = await _service.DeleteAsync(999);

            // Assert
            result.Should().NotBeNull();
            result.IsSuccess.Should().BeFalse();
            result.StatusCode.Should().Be(HttpStatusCode.NotFound);
            result.ErrorMessages?.FirstOrDefault().Should().Contain("Không tìm thấy template CV");
        }

        [Theory]
        [InlineData(0)]
        [InlineData(-1)]
        public async Task DeleteAsync_InvalidId_ShouldReturnBadRequest(int invalidId)
        {
            // Act
            var result = await _service.DeleteAsync(invalidId);

            // Assert
            result.Should().NotBeNull();
            result.IsSuccess.Should().BeFalse();
            result.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            result.ErrorMessages?.FirstOrDefault().Should().Contain("ID không hợp lệ");
        }

        [Fact]
        public async Task DeleteAsync_WithImageFile_ShouldDeleteBothFiles()
        {
            // Arrange
            var template = new TemplateCV
            {
                Id = 1,
                Name = "Test Template",
                PathUrl = "https://blob.url/template1.html",
                ImageUrl = "https://blob.url/image1.jpg"
            };

            _mockRepository
                .Setup(x => x.GetByIdAsync(1))
                .ReturnsAsync(template);

            _mockRepository
                .Setup(x => x.DeleteAsync(It.IsAny<TemplateCV>()))
                .Callback<TemplateCV>(t => { /* Mock delete operation */ });

            _mockBlobStorageService
                .Setup(x => x.DeleteFileAsync(It.IsAny<string>()))
                .ReturnsAsync(true);

            // Act
            var result = await _service.DeleteAsync(1);

            // Assert
            result.Should().NotBeNull();
            result.IsSuccess.Should().BeTrue();
            
            _mockBlobStorageService.Verify(x => x.DeleteFileAsync(template.PathUrl!), Times.Once);
            _mockBlobStorageService.Verify(x => x.DeleteFileAsync(template.ImageUrl!), Times.Once);
        }

        #endregion

        #region Helper Methods

        private static IFormFile CreateMockFile(string fileName, string contentType)
        {
            var mockFile = new Mock<IFormFile>();
            mockFile.Setup(f => f.FileName).Returns(fileName);
            mockFile.Setup(f => f.ContentType).Returns(contentType);
            mockFile.Setup(f => f.Length).Returns(1024);
            mockFile.Setup(f => f.OpenReadStream()).Returns(new MemoryStream());
            mockFile.Setup(f => f.ContentDisposition).Returns($"form-data; name=\"file\"; filename=\"{fileName}\"");
            return mockFile.Object;
        }

        #endregion

        #region IDisposable

        public void Dispose()
        {
            // Cleanup if needed
        }

        #endregion
    }
}