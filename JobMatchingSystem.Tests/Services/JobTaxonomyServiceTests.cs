using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Implementations;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace JobMatchingSystem.Tests.Services
{
    public class JobTaxonomyServiceTests
    {
        private readonly Mock<IJobTaxonomyRepository> _repoMock;
        private readonly JobTaxonomyService _service;

        public JobTaxonomyServiceTests()
        {
            _repoMock = new Mock<IJobTaxonomyRepository>();
            _service = new JobTaxonomyService(_repoMock.Object);
        }

        #region GetByIdAsync Tests
        [Fact]
        public async Task GetByIdAsync_ValidId_ShouldReturnMappedResponse()
        {
            var entity = new JobTaxonomy
            {
                Id = 1,
                JobId = 10,
                TaxonomyId = 5,
                Taxonomy = new Taxonomy { Id = 5, Name = "Category A" }
            };
            _repoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(entity);

            var result = await _service.GetByIdAsync(1);

            Assert.NotNull(result);
            Assert.Equal(entity.Id, result.Id);
            Assert.Equal(entity.JobId, result.JobId);
            Assert.Equal(entity.TaxonomyId, result.TaxonomyId);
            Assert.Equal(entity.Taxonomy.Name, result.TaxonomyName);
        }

        [Fact]
        public async Task GetByIdAsync_NotFound_ShouldThrowAppException()
        {
            _repoMock.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((JobTaxonomy)null);
            await Assert.ThrowsAsync<AppException>(() => _service.GetByIdAsync(999));
        }
        #endregion

        #region GetByJobIdAsync Tests
        [Fact]
        public async Task GetByJobIdAsync_ShouldReturnMappedList()
        {
            var data = new List<JobTaxonomy>
            {
                new JobTaxonomy { Id = 1, JobId = 10, TaxonomyId = 5, Taxonomy = new Taxonomy { Id = 5, Name = "Cat1" } },
                new JobTaxonomy { Id = 2, JobId = 10, TaxonomyId = 6, Taxonomy = new Taxonomy { Id = 6, Name = "Cat2" } }
            };
            _repoMock.Setup(r => r.GetByJobIdAsync(10)).ReturnsAsync(data);

            var result = await _service.GetByJobIdAsync(10);

            Assert.Equal(2, result.Count);
            Assert.Equal("Cat1", result[0].TaxonomyName);
            Assert.Equal("Cat2", result[1].TaxonomyName);
        }

        [Fact]
        public async Task GetByJobIdAsync_EmptyList_ShouldReturnEmpty()
        {
            _repoMock.Setup(r => r.GetByJobIdAsync(20)).ReturnsAsync(new List<JobTaxonomy>());
            var result = await _service.GetByJobIdAsync(20);
            Assert.NotNull(result);
            Assert.Empty(result);
        }
        #endregion

        #region CreateAsync Tests
        [Fact]
        public async Task CreateAsync_ValidRequest_ShouldCallRepositoryCreateAndMapCorrectly()
        {
            var request = new CreateJobTaxonomyRequest { JobId = 1, TaxonomyId = 2 };
            var job = new Job
            {
                JobId = 1,
                Title = "Test Job",
                RecuiterId = 100
            };
            _repoMock.Setup(r => r.GetJobAsync(1)).ReturnsAsync(job);
            _repoMock.Setup(r => r.TaxonomyExistsAsync(2)).ReturnsAsync(true);

            JobTaxonomy captured = null;
            _repoMock.Setup(r => r.CreateAsync(It.IsAny<JobTaxonomy>()))
                .Callback<JobTaxonomy>(jt => captured = jt)
                .Returns(Task.CompletedTask);

            await _service.CreateAsync(request, 100);

            _repoMock.Verify(r => r.CreateAsync(It.IsAny<JobTaxonomy>()), Times.Once);
            Assert.NotNull(captured);
            Assert.Equal(request.JobId, captured.JobId);
            Assert.Equal(request.TaxonomyId, captured.TaxonomyId);
        }

        [Fact]
        public async Task CreateAsync_JobNotFound_ShouldThrowAppException()
        {
            var request = new CreateJobTaxonomyRequest { JobId = 999, TaxonomyId = 1 };
            _repoMock.Setup(r => r.GetJobAsync(999)).ReturnsAsync((Job)null);
            await Assert.ThrowsAsync<AppException>(() => _service.CreateAsync(request, 100));
        }

        [Fact]
        public async Task CreateAsync_JobNotOwnedByUser_ShouldThrowAppException()
        {
            var request = new CreateJobTaxonomyRequest { JobId = 1, TaxonomyId = 1 };
            var job = new Job { JobId = 1, RecuiterId = 200 };
            _repoMock.Setup(r => r.GetJobAsync(1)).ReturnsAsync(job);
            await Assert.ThrowsAsync<AppException>(() => _service.CreateAsync(request, 100));
        }

        [Fact]
        public async Task CreateAsync_TaxonomyNotExists_ShouldThrowAppException()
        {
            var request = new CreateJobTaxonomyRequest { JobId = 1, TaxonomyId = 99 };
            var job = new Job { JobId = 1, RecuiterId = 100 };
            _repoMock.Setup(r => r.GetJobAsync(1)).ReturnsAsync(job);
            _repoMock.Setup(r => r.TaxonomyExistsAsync(99)).ReturnsAsync(false);
            await Assert.ThrowsAsync<AppException>(() => _service.CreateAsync(request, 100));
        }
        #endregion

        #region DeleteAsync Tests
        [Fact]
        public async Task DeleteAsync_ValidId_ShouldCallRepositoryDelete()
        {
            var entity = new JobTaxonomy { Id = 1, JobId = 10 };
            var job = new Job { JobId = 10, RecuiterId = 100 };
            _repoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(entity);
            _repoMock.Setup(r => r.GetJobAsync(10)).ReturnsAsync(job);

            await _service.DeleteAsync(1, 100);

            _repoMock.Verify(r => r.DeleteAsync(entity), Times.Once);
        }

        [Fact]
        public async Task DeleteAsync_NotFound_ShouldThrowAppException()
        {
            _repoMock.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((JobTaxonomy)null);
            await Assert.ThrowsAsync<AppException>(() => _service.DeleteAsync(999, 100));
        }

        [Fact]
        public async Task DeleteAsync_JobNotFound_ShouldThrowAppException()
        {
            var entity = new JobTaxonomy { Id = 1, JobId = 10 };
            _repoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(entity);
            _repoMock.Setup(r => r.GetJobAsync(10)).ReturnsAsync((Job)null);
            await Assert.ThrowsAsync<AppException>(() => _service.DeleteAsync(1, 100));
        }

        [Fact]
        public async Task DeleteAsync_JobNotOwnedByUser_ShouldThrowAppException()
        {
            var entity = new JobTaxonomy { Id = 1, JobId = 10 };
            var job = new Job { JobId = 10, RecuiterId = 200 };
            _repoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(entity);
            _repoMock.Setup(r => r.GetJobAsync(10)).ReturnsAsync(job);
            await Assert.ThrowsAsync<AppException>(() => _service.DeleteAsync(1, 100));
        }
        #endregion
    }
}
