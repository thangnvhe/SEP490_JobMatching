using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Implementations;
using Microsoft.EntityFrameworkCore;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace JobMatchingSystem.Tests.Services
{
    public class JobStageServiceTests
    {
        private readonly Mock<IJobStageRepository> _repoMock;
        private readonly ApplicationDbContext _context;
        private readonly JobStageService _service;

        public JobStageServiceTests()
        {
            _repoMock = new Mock<IJobStageRepository>();

            // Dùng InMemory Database cho DbContext
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            _context = new ApplicationDbContext(options);

            _service = new JobStageService(_repoMock.Object, _context);
        }

        #region Helper methods
        private Job CreateSampleJob(int jobId = 1)
        {
            return new Job
            {
                JobId = jobId,
                Title = "Software Engineer",
                Description = "Sample job description",   // REQUIRED
                Requirements = "Sample requirements",     // REQUIRED
                Benefits = "Sample benefits",             // REQUIRED
                Location = "Hanoi",                       // REQUIRED
                JobType = "Full-time",                    // REQUIRED
                CompanyId = 1,
                RecuiterId = 1
            };
        }

        private JobStage CreateSampleJobStage(int id = 1, int jobId = 1, int? managerId = 1)
        {
            return new JobStage
            {
                Id = id,
                JobId = jobId,
                StageNumber = 1,
                Name = "Initial Interview",
                HiringManagerId = managerId,
                HiringManager = managerId.HasValue ? new ApplicationUser { Id = managerId.Value, FullName = "Manager A" } : null
            };
        }
        #endregion

        #region GetByJobIdAsync Tests
        [Fact]
        public async Task GetByJobIdAsync_WhenStagesExist_ShouldReturnMappedList()
        {
            var jobStage = CreateSampleJobStage();
            _context.JobStages.Add(jobStage);
            _context.SaveChanges();

            var result = await _service.GetByJobIdAsync(jobStage.JobId);

            Assert.Single(result);
            Assert.Equal(jobStage.Id, result[0].Id);
            Assert.Equal(jobStage.HiringManager?.FullName, result[0].HiringManagerName);
        }

        [Fact]
        public async Task GetByJobIdAsync_WhenNoStages_ShouldThrowAppException()
        {
            await Assert.ThrowsAsync<AppException>(() => _service.GetByJobIdAsync(999));
        }
        #endregion

        #region GetByIdAsync Tests
        [Fact]
        public async Task GetByIdAsync_ValidId_ShouldReturnMappedResponse()
        {
            var stage = CreateSampleJobStage();
            _context.JobStages.Add(stage);
            _context.SaveChanges();

            var result = await _service.GetByIdAsync(stage.Id);

            Assert.NotNull(result);
            Assert.Equal(stage.Name, result.Name);
            Assert.Equal(stage.HiringManager?.FullName, result.HiringManagerName);
        }

        [Fact]
        public async Task GetByIdAsync_NotFound_ShouldThrowAppException()
        {
            await Assert.ThrowsAsync<AppException>(() => _service.GetByIdAsync(999));
        }
        #endregion

        #region CreateAsync Tests
        [Fact]
        public async Task CreateAsync_ValidRequest_ShouldCallRepoCreate()
        {
            var job = CreateSampleJob();
            _context.Jobs.Add(job);
            _context.SaveChanges();

            var request = new JobStageRequest
            {
                JobId = job.JobId,
                StageNumber = 1,
                Name = "Technical Interview",
                HiringManagerId = 1
            };

            await _service.CreateAsync(request);

            _repoMock.Verify(r => r.CreateAsync(It.IsAny<JobStage>()), Times.Once);
        }


        [Fact]
        public async Task CreateAsync_JobNotFound_ShouldThrowAppException()
        {
            var request = new JobStageRequest
            {
                JobId = 999,
                StageNumber = 1,
                Name = "Technical Interview"
            };

            await Assert.ThrowsAsync<AppException>(() => _service.CreateAsync(request));
        }
        #endregion

        #region UpdateAsync Tests
        [Fact]
        public async Task UpdateAsync_ValidRequest_ShouldUpdateFields()
        {
            var stage = CreateSampleJobStage();
            _repoMock.Setup(r => r.GetByIdAsync(stage.Id)).ReturnsAsync(stage);

            var request = new UpdateJobStageRequest
            {
                StageNumber = 2,
                Name = "Final Interview",
                HiringManagerId = 2
            };

            await _service.UpdateAsync(stage.Id, request);

            Assert.Equal(request.StageNumber, stage.StageNumber);
            Assert.Equal(request.Name, stage.Name);
            Assert.Equal(request.HiringManagerId, stage.HiringManagerId);
            _repoMock.Verify(r => r.UpdateAsync(stage), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_NotFound_ShouldThrowAppException()
        {
            _repoMock.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((JobStage)null);

            await Assert.ThrowsAsync<AppException>(() => _service.UpdateAsync(999, new UpdateJobStageRequest()));
        }
        #endregion

        #region DeleteAsync Tests
        [Fact]
        public async Task DeleteAsync_ValidIdWithoutCandidateStages_ShouldCallRepoDelete()
        {
            var stage = CreateSampleJobStage();
            _repoMock.Setup(r => r.GetByIdAsync(stage.Id)).ReturnsAsync(stage);

            await _service.DeleteAsync(stage.Id);

            _repoMock.Verify(r => r.DeleteAsync(stage), Times.Once);
        }

        [Fact]
        public async Task DeleteAsync_WithCandidateStages_ShouldThrowAppException()
        {
            var stage = CreateSampleJobStage();
            _repoMock.Setup(r => r.GetByIdAsync(stage.Id)).ReturnsAsync(stage);

            // Add a CandidateStage to context
            _context.CandidateStages.Add(new CandidateStage
            {
                Id = 1,
                JobStageId = stage.Id,
                CandidateJobId = 1
            });
            _context.SaveChanges();

            await Assert.ThrowsAsync<AppException>(() => _service.DeleteAsync(stage.Id));
        }

        [Fact]
        public async Task DeleteAsync_NotFound_ShouldThrowAppException()
        {
            _repoMock.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((JobStage)null);

            await Assert.ThrowsAsync<AppException>(() => _service.DeleteAsync(999));
        }
        #endregion
    }
}
