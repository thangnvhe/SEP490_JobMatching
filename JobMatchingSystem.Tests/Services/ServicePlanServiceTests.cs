using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Implementations;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace JobMatchingSystem.Tests.Services
{
    public class ServicePlanServiceTests
    {
        private readonly Mock<IServicePlanRepository> _servicePlanRepoMock;
        private readonly ServicePlanService _service;

        public ServicePlanServiceTests()
        {
            _servicePlanRepoMock = new Mock<IServicePlanRepository>();
            _service = new ServicePlanService(_servicePlanRepoMock.Object);
        }

        #region CreateAsync Tests

        [Fact]
        public async Task CreateAsync_ValidRequest_ShouldCallRepositoryAddAsync()
        {
            var request = new CreateServicePlanRequest
            {
                Name = "Plan A",
                Description = "Test",
                Price = 100,
                JobPostAdditional = 1,
                HighlightJobDays = 3,
                HighlightJobDaysCount = 2,
                ExtensionJobDays = 5,
                ExtensionJobDaysCount = 1,
                CVSaveAdditional = 10
            };

            await _service.CreateAsync(request);

            _servicePlanRepoMock.Verify(r => r.AddAsync(It.IsAny<ServicePlan>()), Times.Once);
        }

        [Fact]
        public async Task CreateAsync_NullRequest_ShouldThrowException()
        {
            await Assert.ThrowsAsync<NullReferenceException>(() => _service.CreateAsync(null));
        }

        [Fact]
        public async Task CreateAsync_ShouldMapAllFieldsCorrectly()
        {
            var request = new CreateServicePlanRequest
            {
                Name = "Plan X",
                Description = "Desc X",
                Price = 200,
                JobPostAdditional = 2,
                HighlightJobDays = 4,
                HighlightJobDaysCount = 3,
                ExtensionJobDays = 6,
                ExtensionJobDaysCount = 2,
                CVSaveAdditional = 20
            };

            ServicePlan captured = null;

            _servicePlanRepoMock
                .Setup(r => r.AddAsync(It.IsAny<ServicePlan>()))
                .Callback<ServicePlan>(p => captured = p);

            await _service.CreateAsync(request);

            Assert.NotNull(captured);
            Assert.Equal(request.Name, captured.Name);
            Assert.Equal(request.Description, captured.Description);
            Assert.Equal(request.Price, captured.Price);
            Assert.Equal(request.JobPostAdditional, captured.JobPostAdditional);
            Assert.Equal(request.HighlightJobDays, captured.HighlightJobDays);
            Assert.Equal(request.HighlightJobDaysCount, captured.HighlightJobDaysCount);
            Assert.Equal(request.ExtensionJobDays, captured.ExtensionJobDays);
            Assert.Equal(request.ExtensionJobDaysCount, captured.ExtensionJobDaysCount);
            Assert.Equal(request.CVSaveAdditional, captured.CVSaveAdditional);
        }

        [Fact]
        public async Task CreateAsync_ShouldNotThrow_WhenOptionalFieldsAreNull()
        {
            var request = new CreateServicePlanRequest
            {
                Name = "Plan Null Option",
                Description = "Test",
                Price = 100
            };

            var ex = await Record.ExceptionAsync(() => _service.CreateAsync(request));

            Assert.Null(ex);
            _servicePlanRepoMock.Verify(r => r.AddAsync(It.IsAny<ServicePlan>()), Times.Once);
        }

        #endregion


        #region GetAllAsync Tests

        [Fact]
        public async Task GetAllAsync_WhenRepositoryReturnsEmptyList_ShouldReturnEmptyList()
        {
            _servicePlanRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<ServicePlan>());

            var result = await _service.GetAllAsync();

            Assert.NotNull(result);
            Assert.Empty(result);
        }

        [Fact]
        public async Task GetAllAsync_WhenRepositoryReturnsData_ShouldMapCorrectly()
        {
            var repoData = new List<ServicePlan>
    {
        new ServicePlan
        {
            Id = 1, Name = "Plan A", Description = "Test", Price = 100,
            JobPostAdditional = 5, HighlightJobDays = 2, HighlightJobDaysCount = 1,
            ExtensionJobDays = 7, ExtensionJobDaysCount = 3, CVSaveAdditional = 10
        }
    };

            _servicePlanRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(repoData);

            var result = await _service.GetAllAsync();

            Assert.Single(result);
            var item = result[0];

            Assert.Equal(repoData[0].Id, item.Id);
            Assert.Equal(repoData[0].Name, item.Name);
            Assert.Equal(repoData[0].Description, item.Description);
            Assert.Equal(repoData[0].Price, item.Price);
            Assert.Equal(repoData[0].JobPostAdditional, item.JobPostAdditional);
            Assert.Equal(repoData[0].HighlightJobDays, item.HighlightJobDays);
            Assert.Equal(repoData[0].HighlightJobDaysCount, item.HighlightJobDaysCount);
            Assert.Equal(repoData[0].ExtensionJobDays, item.ExtensionJobDays);
            Assert.Equal(repoData[0].ExtensionJobDaysCount, item.ExtensionJobDaysCount);
            Assert.Equal(repoData[0].CVSaveAdditional, item.CVSaveAdditional);
        }

        [Fact]
        public async Task GetAllAsync_ShouldCallRepositoryGetAllAsyncOnce()
        {
            _servicePlanRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<ServicePlan>());

            await _service.GetAllAsync();

            _servicePlanRepoMock.Verify(r => r.GetAllAsync(), Times.Once);
        }

        [Fact]
        public async Task GetAllAsync_WhenMultipleItems_ShouldReturnSameCount()
        {
            var repoData = new List<ServicePlan>
    {
        new ServicePlan{Id=1}, new ServicePlan{Id=2}, new ServicePlan{Id=3}
    };

            _servicePlanRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(repoData);

            var result = await _service.GetAllAsync();

            Assert.Equal(3, result.Count);
        }

        [Fact]
        public async Task GetAllAsync_ShouldHandleNullOptionalFieldsCorrectly()
        {
            var repoData = new List<ServicePlan>
    {
        new ServicePlan
        {
            Id=1, Name="Plan Null", Description="Test", Price=50
        }
    };

            _servicePlanRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(repoData);

            var result = await _service.GetAllAsync();

            Assert.Null(result[0].JobPostAdditional);
            Assert.Null(result[0].HighlightJobDays);
            Assert.Null(result[0].HighlightJobDaysCount);
            Assert.Null(result[0].ExtensionJobDays);
            Assert.Null(result[0].ExtensionJobDaysCount);
            Assert.Null(result[0].CVSaveAdditional);
        }

        #endregion


        #region GetByIdAsync Tests

        [Fact]
        public async Task GetByIdAsync_ValidId_ShouldReturnMappedResponse()
        {
            var plan = new ServicePlan
            {
                Id = 1,
                Name = "Plan A",
                Description = "Test",
                Price = 100,
                JobPostAdditional = 5,
                HighlightJobDays = 2,
                HighlightJobDaysCount = 1,
                ExtensionJobDays = 7,
                ExtensionJobDaysCount = 3,
                CVSaveAdditional = 8
            };

            _servicePlanRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(plan);

            var result = await _service.GetByIdAsync(1);

            Assert.NotNull(result);
            Assert.Equal(plan.Id, result.Id);
            Assert.Equal(plan.Name, result.Name);
            Assert.Equal(plan.Description, result.Description);
            Assert.Equal(plan.Price, result.Price);
            Assert.Equal(plan.JobPostAdditional, result.JobPostAdditional);
            Assert.Equal(plan.HighlightJobDays, result.HighlightJobDays);
            Assert.Equal(plan.HighlightJobDaysCount, result.HighlightJobDaysCount);
            Assert.Equal(plan.ExtensionJobDays, result.ExtensionJobDays);
            Assert.Equal(plan.ExtensionJobDaysCount, result.ExtensionJobDaysCount);
            Assert.Equal(plan.CVSaveAdditional, result.CVSaveAdditional);
        }

        [Fact]
        public async Task GetByIdAsync_IdNotFound_ShouldThrowAppException()
        {
            _servicePlanRepoMock.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((ServicePlan)null);

            await Assert.ThrowsAsync<AppException>(() => _service.GetByIdAsync(999));
        }

        [Fact]
        public async Task GetByIdAsync_ShouldCallRepositoryGetByIdOnce()
        {
            _servicePlanRepoMock.Setup(r => r.GetByIdAsync(5)).ReturnsAsync(new ServicePlan());

            await _service.GetByIdAsync(5);

            _servicePlanRepoMock.Verify(r => r.GetByIdAsync(5), Times.Once);
        }

        #endregion


        #region UpdateAsync Tests

        [Fact]
        public async Task UpdateAsync_ValidRequest_ShouldUpdateFields()
        {
            var plan = new ServicePlan
            {
                Id = 1,
                Name = "Old",
                Description = "Old Desc",
                Price = 10,
                JobPostAdditional = 1
            };

            var req = new UpdateServicePlanRequest
            {
                Name = "New Name",
                Description = "New Desc",
                Price = 20,
                JobPostAdditional = 5
            };

            _servicePlanRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(plan);

            await _service.UpdateAsync(1, req);

            Assert.Equal("New Name", plan.Name);
            Assert.Equal("New Desc", plan.Description);
            Assert.Equal(20, plan.Price);
            Assert.Equal(5, plan.JobPostAdditional);

            _servicePlanRepoMock.Verify(r => r.UpdateAsync(plan), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_IdNotFound_ShouldThrowAppException()
        {
            _servicePlanRepoMock.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((ServicePlan)null);

            await Assert.ThrowsAsync<AppException>(() => _service.UpdateAsync(999, new UpdateServicePlanRequest()));
        }

        [Fact]
        public async Task UpdateAsync_ShouldOnlyUpdateNonNullFields()
        {
            var plan = new ServicePlan { Id = 1, Name = "Old", Description = "Desc", Price = 100 };
            var req = new UpdateServicePlanRequest { Name = "New Name" };

            _servicePlanRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(plan);

            await _service.UpdateAsync(1, req);

            Assert.Equal("New Name", plan.Name);
            Assert.Equal("Desc", plan.Description);
            Assert.Equal(100, plan.Price);
        }

        [Fact]
        public async Task UpdateAsync_IgnoreEmptyName_ShouldNotUpdateName()
        {
            var plan = new ServicePlan { Id = 1, Name = "Old Name" };
            var req = new UpdateServicePlanRequest { Name = "" };

            _servicePlanRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(plan);

            await _service.UpdateAsync(1, req);

            Assert.Equal("Old Name", plan.Name);
        }

        [Fact]
        public async Task UpdateAsync_IgnoreInvalidPrice_ShouldNotUpdatePrice()
        {
            var plan = new ServicePlan { Id = 1, Price = 50 };
            var req = new UpdateServicePlanRequest { Price = -10 };

            _servicePlanRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(plan);

            await _service.UpdateAsync(1, req);

            Assert.Equal(50, plan.Price);
        }

        #endregion


        #region DeleteAsync Tests

        [Fact]
        public async Task DeleteAsync_ValidId_ShouldDeletePlan()
        {
            var plan = new ServicePlan { Id = 1 };

            _servicePlanRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(plan);

            await _service.DeleteAsync(1);

            _servicePlanRepoMock.Verify(r => r.DeleteAsync(plan), Times.Once);
        }

        [Fact]
        public async Task DeleteAsync_IdNotFound_ShouldThrowAppException()
        {
            _servicePlanRepoMock.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((ServicePlan)null);

            await Assert.ThrowsAsync<AppException>(() => _service.DeleteAsync(999));
        }

        [Fact]
        public async Task DeleteAsync_ShouldCallRepositoryGetByIdOnce()
        {
            _servicePlanRepoMock.Setup(r => r.GetByIdAsync(5)).ReturnsAsync(new ServicePlan());

            await _service.DeleteAsync(5);

            _servicePlanRepoMock.Verify(r => r.GetByIdAsync(5), Times.Once);
        }

        #endregion

    }
}
