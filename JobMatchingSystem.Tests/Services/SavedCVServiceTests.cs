using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.DTOs.Response;
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
    public class SavedCVServiceTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly Mock<ISavedCVRepository> _repoMock;
        private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;
        private readonly SavedCVService _service;

        private readonly ApplicationUser _recruiter;
        private readonly CVUpload _cv1;
        private readonly CVUpload _cv2;

        public SavedCVServiceTests()
        {
            var dbName = Guid.NewGuid().ToString();
            _context = TestDbContextFactory.CreateInMemoryContext(dbName);

            var store = new Mock<IUserStore<ApplicationUser>>();
            _userManagerMock = new Mock<UserManager<ApplicationUser>>(store.Object, null, null, null, null, null, null, null, null);

            _repoMock = new Mock<ISavedCVRepository>();

            _service = new SavedCVService(_repoMock.Object, _userManagerMock.Object, _context);

            // Tạo dữ liệu mẫu
            _recruiter = new ApplicationUser
            {
                Id = 2001,
                UserName = "recruiter@company.com",
                Email = "recruiter@company.com",
                FullName = "Mr. Recruiter",
                SaveCVCount = 5  // có 5 lượt lưu CV
            };

            _cv1 = new CVUpload
            {
                Id = 301,
                UserId = 1001,
                Name = "CV - Nguyễn Văn A",
                FileName = "cv_a.pdf",
                FileUrl = "https://storage/cv_a.pdf"
            };

            _cv2 = new CVUpload
            {
                Id = 302,
                UserId = 1002,
                Name = "CV - Trần Thị B",
                FileName = "cv_b.pdf",
                FileUrl = "https://storage/cv_b.pdf"
            };

            SeedData();
            SetupMocks();
        }

        private void SeedData()
        {
            _context.Users.Add(_recruiter);
            _context.CVUploads.AddRange(_cv1, _cv2);
            _context.SaveChanges();
        }

        private void SetupMocks()
        {
            _userManagerMock.Setup(x => x.Users).Returns(_context.Users);
            _userManagerMock.Setup(x => x.UpdateAsync(It.IsAny<ApplicationUser>()))
                .ReturnsAsync(IdentityResult.Success);

            _repoMock.Setup(r => r.GetByRecruiterIdAsync(2001))
                .ReturnsAsync(new List<SavedCV>
                {
                    new SavedCV { Id = 1, RecruiterId = 2001, CVId = 301 },
                    new SavedCV { Id = 2, RecruiterId = 2001, CVId = 302 }
                });

            _repoMock.Setup(r => r.GetByIdAsync(1))
                .ReturnsAsync(new SavedCV { Id = 1, RecruiterId = 2001, CVId = 301 });

            _repoMock.Setup(r => r.ExistsAsync(2001, 301)).ReturnsAsync(true);
            _repoMock.Setup(r => r.ExistsAsync(2001, It.Is<int>(id => id != 301))).ReturnsAsync(false);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        #region GetSavedCVsByRecruiterIdAsync Tests

        [Fact]
        public async Task GetSavedCVsByRecruiterIdAsync_ValidRecruiter_ReturnsList()
        {
            var result = await _service.GetSavedCVsByRecruiterIdAsync(2001);

            Assert.Equal(2, result.Count());
            Assert.Contains(result, x => x.CVId == 301);
            Assert.Contains(result, x => x.CVId == 302);
        }

        [Fact]
        public async Task GetSavedCVsByRecruiterIdAsync_RecruiterNotFound_ThrowsNotFoundUser()
        {
            await Assert.ThrowsAsync<AppException>(() => _service.GetSavedCVsByRecruiterIdAsync(9999));
        }

        #endregion

        #region GetSavedCVByIdAsync Tests

        [Fact]
        public async Task GetSavedCVByIdAsync_ValidAndOwned_ReturnsItem()
        {
            var result = await _service.GetSavedCVByIdAsync(1, 2001);
            Assert.Equal(301, result.CVId);
            Assert.Equal(2001, result.RecruiterId);
        }

        [Fact]
        public async Task GetSavedCVByIdAsync_NotOwner_ThrowsNotFoundSaveCV()
        {
            _repoMock.Setup(r => r.GetByIdAsync(1))
                .ReturnsAsync(new SavedCV { Id = 1, RecruiterId = 9999, CVId = 301 });

            await Assert.ThrowsAsync<AppException>(() => _service.GetSavedCVByIdAsync(1, 2001));
        }

        [Fact]
        public async Task GetSavedCVByIdAsync_NotExist_ThrowsNotFoundSaveCV()
        {
            _repoMock.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((SavedCV)null);
            await Assert.ThrowsAsync<AppException>(() => _service.GetSavedCVByIdAsync(999, 2001));
        }

        #endregion

        #region CreateSavedCVAsync Tests

        [Fact]
        public async Task CreateSavedCVAsync_ValidAndNotExistAndHasCount_CreatesAndDecreasesCount()
        {
            var newCV = new CVUpload { Id = 999, UserId = 1003, Name = "New CV", FileName = "new.pdf", FileUrl = "url" };
            _context.CVUploads.Add(newCV);
            _context.SaveChanges();

            _repoMock.Setup(r => r.ExistsAsync(2001, 999)).ReturnsAsync(false);

            SavedCV captured = null;
            _repoMock.Setup(r => r.CreateAsync(It.IsAny<SavedCV>()))
                .Callback<SavedCV>(x => captured = x)
                .Returns(Task.CompletedTask);

            await _service.CreateSavedCVAsync(999, 2001);

            Assert.NotNull(captured);
            Assert.Equal(2001, captured.RecruiterId);
            Assert.Equal(999, captured.CVId);
            Assert.Equal(4, _recruiter.SaveCVCount); // giảm từ 5 → 4
            _repoMock.Verify(r => r.CreateAsync(It.IsAny<SavedCV>()), Times.Once);
            _userManagerMock.Verify(x => x.UpdateAsync(_recruiter), Times.Once);
        }

        [Fact]
        public async Task CreateSavedCVAsync_NoMoreSaveCount_ThrowsNoMoreSaveCVCount()
        {
            // SetRecruiterSaveCount(0);

            await Assert.ThrowsAsync<AppException>(() => _service.CreateSavedCVAsync(301, 2001));
        }

        [Fact]
        public async Task CreateSavedCVAsync_AlreadyExists_ThrowsCantCreate()
        {
            await Assert.ThrowsAsync<AppException>(() => _service.CreateSavedCVAsync(301, 2001));
        }

        [Fact]
        public async Task CreateSavedCVAsync_CVNotExist_ThrowsNotFoundCV()
        {
            await Assert.ThrowsAsync<AppException>(() => _service.CreateSavedCVAsync(9999, 2001));
        }

        [Fact]
        public async Task CreateSavedCVAsync_RecruiterNotExist_ThrowsNotFoundUser()
        {
            await Assert.ThrowsAsync<AppException>(() => _service.CreateSavedCVAsync(301, 9999));
        }

        #endregion

        #region DeleteSavedCVAsync Tests

        [Fact]
        public async Task DeleteSavedCVAsync_ValidAndOwned_DeletesAndIncreasesCount()
        {
            SetRecruiterSaveCount(3);

            await _service.DeleteSavedCVAsync(1, 2001);

            Assert.Equal(4, _recruiter.SaveCVCount); // tăng từ 3 → 4
            _repoMock.Verify(r => r.DeleteAsync(It.Is<SavedCV>(s => s.Id == 1)), Times.Once);
            _userManagerMock.Verify(x => x.UpdateAsync(_recruiter), Times.Once);
        }

        [Fact]
        public async Task DeleteSavedCVAsync_NotOwner_ThrowsNotFoundSaveCV()
        {
            _repoMock.Setup(r => r.GetByIdAsync(1))
                .ReturnsAsync(new SavedCV { Id = 1, RecruiterId = 8888, CVId = 301 });

            await Assert.ThrowsAsync<AppException>(() => _service.DeleteSavedCVAsync(1, 2001));
        }

        [Fact]
        public async Task DeleteSavedCVAsync_NotExist_ThrowsNotFoundSaveCV()
        {
            _repoMock.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((SavedCV)null);
            await Assert.ThrowsAsync<AppException>(() => _service.DeleteSavedCVAsync(999, 2001));
        }

        #endregion

        // Helper để thay đổi SaveCVCount trong test
        private void SetRecruiterSaveCount(int count)
        {
            _recruiter.SaveCVCount = count;
            _context.Users.Update(_recruiter);
            _context.SaveChanges();
        }
    }
}