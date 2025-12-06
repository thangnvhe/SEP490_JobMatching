using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Enums;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Implementations;
using JobMatchingSystem.Tests.Helpers;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace JobMatchingSystem.Tests.Services
{
    public class SavedJobServiceTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly Mock<ISavedJobRepository> _repoMock;
        private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;
        private readonly SavedJobService _service;

        private readonly ApplicationUser _candidate;
        private readonly Job _job1;
        private readonly Job _job2;

        public SavedJobServiceTests()
        {
            var dbName = Guid.NewGuid().ToString();
            _context = TestDbContextFactory.CreateInMemoryContext(dbName);

            var store = new Mock<IUserStore<ApplicationUser>>();
            _userManagerMock = new Mock<UserManager<ApplicationUser>>(store.Object, null, null, null, null, null, null, null, null);

            _repoMock = new Mock<ISavedJobRepository>();

            _service = new SavedJobService(_repoMock.Object, _userManagerMock.Object, _context);

            // Tạo dữ liệu mẫu ĐẦY ĐỦ các trường NOT NULL
            _candidate = new ApplicationUser
            {
                Id = 1001,
                UserName = "candidate@test.com",
                Email = "candidate@test.com",
                FullName = "Nguyễn Văn A"
            };

            _job1 = new Job
            {
                JobId = 101,
                Title = ".NET Developer",
                Description = "Tuyển lập trình viên .NET",     // bắt buộc
                Requirements = "3+ năm kinh nghiệm",          // bắt buộc
                Benefits = "Lương cao, bảo hiểm đầy đủ",      // bắt buộc
                Location = "Hà Nội",                          // bắt buộc
                JobType = "Full-time",                        // bắt buộc
                CompanyId = 1,
                RecuiterId = 201,
                Status = JobStatus.Opened
            };

            _job2 = new Job
            {
                JobId = 102,
                Title = "React Developer",
                Description = "Tuyển lập trình viên React",
                Requirements = "2+ năm kinh nghiệm",
                Benefits = "Remote, thưởng dự án",
                Location = "TP.HCM",
                JobType = "Full-time",
                CompanyId = 1,
                RecuiterId = 201,
                Status = JobStatus.Opened
            };

            SeedData();
            SetupMocks();
        }

        private void SeedData()
        {
            _context.Users.Add(_candidate);
            _context.Jobs.AddRange(_job1, _job2);
            _context.SaveChanges(); // Bây giờ sẽ PASS vì đã đầy đủ field
        }

        private void SetupMocks()
        {
            _userManagerMock.Setup(x => x.Users).Returns(_context.Users);

            // Mock repo
            _repoMock.Setup(r => r.GetByUserIdAsync(1001))
                .ReturnsAsync(new List<SavedJob>
                {
                    new SavedJob { Id = 1, UserId = 1001, JobId = 101 },
                    new SavedJob { Id = 2, UserId = 1001, JobId = 102 }
                });

            _repoMock.Setup(r => r.GetByIdAsync(1))
                .ReturnsAsync(new SavedJob { Id = 1, UserId = 1001, JobId = 101 });

            _repoMock.Setup(r => r.ExistsAsync(1001, 101)).ReturnsAsync(true);
            _repoMock.Setup(r => r.ExistsAsync(1001, It.Is<int>(id => id != 101))).ReturnsAsync(false);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        #region GetSavedJobsByUserIdAsync

        [Fact]
        public async Task GetSavedJobsByUserIdAsync_ValidUser_ReturnsList()
        {
            var result = await _service.GetSavedJobsByUserIdAsync(1001);

            Assert.Equal(2, result.Count());
            Assert.Contains(result, x => x.JobId == 101);
            Assert.Contains(result, x => x.JobId == 102);
        }

        [Fact]
        public async Task GetSavedJobsByUserIdAsync_UserNotFound_ThrowsNotFoundUser()
        {
            await Assert.ThrowsAsync<AppException>(() => _service.GetSavedJobsByUserIdAsync(9999));
        }

        #endregion

        #region GetSavedJobByIdAsync

        [Fact]
        public async Task GetSavedJobByIdAsync_ValidAndOwned_ReturnsItem()
        {
            var result = await _service.GetSavedJobByIdAsync(1, 1001);
            Assert.Equal(101, result.JobId);
        }

        [Fact]
        public async Task GetSavedJobByIdAsync_NotOwner_ThrowsNotFoundSaveJob()
        {
            _repoMock.Setup(r => r.GetByIdAsync(1))
                .ReturnsAsync(new SavedJob { Id = 1, UserId = 999, JobId = 101 });

            await Assert.ThrowsAsync<AppException>(() => _service.GetSavedJobByIdAsync(1, 1001));
        }

        [Fact]
        public async Task GetSavedJobByIdAsync_NotExist_ThrowsNotFoundSaveJob()
        {
            _repoMock.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((SavedJob)null);
            await Assert.ThrowsAsync<AppException>(() => _service.GetSavedJobByIdAsync(999, 1001));
        }

        #endregion

        #region CreateSavedJobAsync

        [Fact]
        public async Task CreateSavedJobAsync_ValidAndNotExist_CreatesSuccessfully()
        {
            var newJob = new Job
            {
                JobId = 999,
                Title = "New Job",
                Description = "Mô tả",
                Requirements = "Yêu cầu",
                Benefits = "Phúc lợi",
                Location = "HN",
                JobType = "Full-time",
                CompanyId = 1,
                RecuiterId = 201,
                Status = JobStatus.Opened
            };
            _context.Jobs.Add(newJob);
            _context.SaveChanges();

            _repoMock.Setup(r => r.ExistsAsync(1001, 999)).ReturnsAsync(false);

            SavedJob captured = null;
            _repoMock.Setup(r => r.CreateAsync(It.IsAny<SavedJob>()))
                .Callback<SavedJob>(x => captured = x)
                .Returns(Task.CompletedTask);

            await _service.CreateSavedJobAsync(999, 1001);

            Assert.NotNull(captured);
            Assert.Equal(1001, captured.UserId);
            Assert.Equal(999, captured.JobId);
            _repoMock.Verify(r => r.CreateAsync(It.IsAny<SavedJob>()), Times.Once);
        }

        [Fact]
        public async Task CreateSavedJobAsync_AlreadyExists_ThrowsCantCreate()
        {
            await Assert.ThrowsAsync<AppException>(() => _service.CreateSavedJobAsync(101, 1001));
        }

        [Fact]
        public async Task CreateSavedJobAsync_JobNotExist_ThrowsNotFoundJob()
        {
            await Assert.ThrowsAsync<AppException>(() => _service.CreateSavedJobAsync(9999, 1001));
        }

        #endregion

        #region DeleteSavedJobAsync

        [Fact]
        public async Task DeleteSavedJobAsync_ValidAndOwned_Deletes()
        {
            await _service.DeleteSavedJobAsync(1, 1001);
            _repoMock.Verify(r => r.DeleteAsync(It.Is<SavedJob>(s => s.Id == 1)), Times.Once);
        }

        [Fact]
        public async Task DeleteSavedJobAsync_NotOwner_ThrowsNotFoundSaveJob()
        {
            _repoMock.Setup(r => r.GetByIdAsync(1))
                .ReturnsAsync(new SavedJob { Id = 1, UserId = 888, JobId = 101 });

            await Assert.ThrowsAsync<AppException>(() => _service.DeleteSavedJobAsync(1, 1001));
        }

        #endregion
    }
}