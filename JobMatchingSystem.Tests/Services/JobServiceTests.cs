using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Enums;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Implementations;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace JobMatchingSystem.Tests.Services
{
    public class JobServiceTests
    {
        private readonly Mock<IJobRepository> _jobRepoMock;
        private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;
        private readonly Mock<IEmailService> _emailServiceMock;
        private readonly Mock<ICandidateJobRepository> _candidateJobRepoMock;
        private readonly ApplicationDbContext _context;
        private readonly JobService _service;

        public JobServiceTests()
        {
            _jobRepoMock = new Mock<IJobRepository>();
            _emailServiceMock = new Mock<IEmailService>();
            _candidateJobRepoMock = new Mock<ICandidateJobRepository>();

            var userStore = new Mock<IUserStore<ApplicationUser>>();
            _userManagerMock = new Mock<UserManager<ApplicationUser>>(userStore.Object, null, null, null, null, null, null, null, null);

            // Setup InMemory DbContext
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            _context = new ApplicationDbContext(options);

            _service = new JobService(
                _jobRepoMock.Object,
                _userManagerMock.Object,
                _context,
                _emailServiceMock.Object,
                _candidateJobRepoMock.Object
            );
        }

        #region CreateJobAsync Tests
        [Fact]
        public async Task CreateJobAsync_ValidRequest_ShouldCreateJobAndDeductQuota()
        {
            // Arrange
            var user = new ApplicationUser { Id = 1, CompanyId = 1 };
            _userManagerMock.Setup(u => u.Users)
                .Returns(new List<ApplicationUser> { user }.AsQueryable().BuildMockDbSet().Object);

            _context.JobQuotas.Add(new JobQuota { RecruiterId = 1, MonthlyQuota = 1 });
            await _context.SaveChangesAsync();

            var request = new CreateJobRequest
            {
                Title = "Job A",
                Description = new string('D', 50),
                Requirements = "Req",
                Benefits = "Benefit",
                Location = "Hanoi",
                JobType = "Full-time",
                OpenedAt = DateTime.UtcNow,
                ExpiredAt = DateTime.UtcNow.AddDays(5)
            };

            // Act
            await _service.CreateJobAsync(request, 1);

            // Assert
            _jobRepoMock.Verify(r => r.CreateAsync(It.IsAny<Job>()), Times.Once);

            var quota = await _context.JobQuotas.FirstAsync(q => q.RecruiterId == 1);
            Assert.Equal(0, quota.MonthlyQuota);
        }

        [Fact]
        public async Task CreateJobAsync_UserNotFound_ShouldThrowAppException()
        {
            // Arrange
            _userManagerMock.Setup(u => u.Users)
                .Returns(new List<ApplicationUser>().AsQueryable().BuildMockDbSet().Object);

            var request = new CreateJobRequest
            {
                Title = "Job A",
                Description = new string('D', 50),
                Requirements = "Req",
                Benefits = "Benefit",
                Location = "Hanoi",
                JobType = "Full-time",
                OpenedAt = DateTime.UtcNow,
                ExpiredAt = DateTime.UtcNow.AddDays(5)
            };

            // Act & Assert
            await Assert.ThrowsAsync<AppException>(() => _service.CreateJobAsync(request, 999));
        }

        [Fact]
        public async Task CreateJobAsync_QuotaNotEnough_ShouldThrowAppException()
        {
            // Arrange
            var user = new ApplicationUser { Id = 1, CompanyId = 1 };
            _userManagerMock.Setup(u => u.Users)
                .Returns(new List<ApplicationUser> { user }.AsQueryable().BuildMockDbSet().Object);

            _context.JobQuotas.Add(new JobQuota { RecruiterId = 1, MonthlyQuota = 0, ExtraQuota = 0 });
            await _context.SaveChangesAsync();

            var request = new CreateJobRequest
            {
                Title = "Job A",
                Description = new string('D', 50),
                Requirements = "Req",
                Benefits = "Benefit",
                Location = "Hanoi",
                JobType = "Full-time",
                OpenedAt = DateTime.UtcNow,
                ExpiredAt = DateTime.UtcNow.AddDays(5)
            };

            // Act & Assert
            await Assert.ThrowsAsync<AppException>(() => _service.CreateJobAsync(request, 1));
        }
        #endregion

        #region GetJobByIdAsync Tests
        [Fact]
        public async Task GetJobByIdAsync_ValidId_ShouldReturnJobDetail()
        {
            // Arrange: tạo Company đầy đủ required fields
            var company = new Company
            {
                Id = 1,
                Name = "Test Company",
                Address = "123 Test Street",
                Description = "Company Description",
                Email = "test@company.com",
                LicenseFile = "license.pdf",
                Logo = "logo.png",
                PhoneContact = "0123456789",
                TaxCode = "1234567890"
            };
            _context.Companies.Add(company);

            // Tạo Position
            var position = new Position { PositionId = 1, Name = "Developer" };
            _context.Positions.Add(position);

            // Tạo Job đầy đủ required fields và liên kết
            var job = new Job
            {
                JobId = 1,
                Title = "Job 1",
                Description = "Full job description",
                Requirements = "Some requirements",
                Benefits = "Some benefits",
                Location = "Hanoi",
                JobType = "Full-time",
                Status = JobStatus.Draft,
                CompanyId = company.Id,
                PositionId = position.PositionId,
                RecuiterId = 1,
                ViewsCount = 0,
                CreatedAt = DateTime.UtcNow,
                OpenedAt = DateTime.UtcNow,
                ExpiredAt = DateTime.UtcNow.AddDays(5),
                JobTaxonomies = new List<JobTaxonomy>()
            };
            _context.Jobs.Add(job);

            await _context.SaveChangesAsync(); // Save tất cả trước khi gọi service

            // Act
            var result = await _service.GetJobByIdAsync(1);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.JobId);
            Assert.Equal(1, result.ViewsCount); // View incremented
        }



        [Fact]
        public async Task GetJobByIdAsync_NotFound_ShouldThrowAppException()
        {
            await Assert.ThrowsAsync<AppException>(() => _service.GetJobByIdAsync(999));
        }
        #endregion

        #region UpdateJobAsync Tests
        [Fact]
        public async Task UpdateJobAsync_ValidRequest_ShouldUpdateJob()
        {
            // Arrange
            var company = new Company
            {
                Id = 1,
                Name = "Test Company",
                Address = "123 Street",
                Description = "Desc",
                Email = "test@company.com",
                LicenseFile = "license.pdf",
                Logo = "logo.png",
                PhoneContact = "0123456789",
                TaxCode = "1234567890"
            };
            _context.Companies.Add(company);

            var position = new Position { PositionId = 1, Name = "Developer" };
            _context.Positions.Add(position);

            var job = new Job
            {
                JobId = 1,
                Title = "Old Title",
                Description = "Old Description",
                Requirements = "Old Req",
                Benefits = "Old Benefits",
                Location = "Old Location",
                JobType = "Part-time",
                Status = JobStatus.Draft,
                CompanyId = company.Id,
                PositionId = position.PositionId,
                RecuiterId = 1,
                ViewsCount = 0,
                CreatedAt = DateTime.UtcNow,
                OpenedAt = DateTime.UtcNow,
                ExpiredAt = DateTime.UtcNow.AddDays(5)
            };
            _context.Jobs.Add(job);
            await _context.SaveChangesAsync();

            var request = new UpdateJobRequest
            {
                Title = "New Title",
                Description = "New Description",
                Requirements = "New Req",
                Benefits = "New Benefits",
                Location = "New Location",
                JobType = "Full-time",
                OpenedAt = DateTime.UtcNow,
                ExpiredAt = DateTime.UtcNow.AddDays(10)
            };

            // Act
            await _service.UpdateJobAsync(1, request, 1);

            // Assert
            var updatedJob = await _context.Jobs.FirstAsync(j => j.JobId == 1);
            Assert.Equal("New Title", updatedJob.Title);
            Assert.Equal("New Description", updatedJob.Description);
            Assert.Equal("New Req", updatedJob.Requirements);
            Assert.Equal("New Benefits", updatedJob.Benefits);
            Assert.Equal("New Location", updatedJob.Location);
            Assert.Equal("Full-time", updatedJob.JobType);
            Assert.Equal(request.OpenedAt, updatedJob.OpenedAt);
            Assert.Equal(request.ExpiredAt, updatedJob.ExpiredAt);
        }

        [Fact]
        public async Task UpdateJobAsync_JobNotFound_ShouldThrowAppException()
        {
            // Arrange
            var request = new UpdateJobRequest
            {
                Title = "New Title",
                Description = "New Description",
                Requirements = "New Req",
                Benefits = "New Benefits",
                Location = "New Location",
                JobType = "Full-time",
                OpenedAt = DateTime.UtcNow,
                ExpiredAt = DateTime.UtcNow.AddDays(10)
            };

            // Act & Assert
            await Assert.ThrowsAsync<AppException>(() => _service.UpdateJobAsync(999, request, 1));
        }
        #endregion

        #region CensorJobAsync Tests
        [Fact]
        public async Task CensorJobAsync_ValidStatus_ShouldUpdateStatusAndSendEmail()
        {
            // Arrange
            var job = new Job
            {
                JobId = 1,
                Title = "Job 1",
                Description = "Job description",
                Requirements = "Job requirements",
                Benefits = "Job benefits",
                Location = "Hanoi",
                JobType = "Full-time",
                Status = JobStatus.Draft,
                Recruiter = new ApplicationUser { Email = "test@test.com", FullName = "Recruiter" }
            };


            _context.Jobs.Add(job);
            await _context.SaveChangesAsync();

            var request = new CensorJobRequest { Status = JobStatus.Moderated };

            // Act
            await _service.CensorJobAsync(1, request, 2);

            // Assert
            var updatedJob = await _context.Jobs.FirstAsync(j => j.JobId == 1);
            Assert.Equal(JobStatus.Moderated, updatedJob.Status);
            Assert.Equal(2, updatedJob.VerifiedBy);

            _emailServiceMock.Verify(e => e.SendEmailAsync(
                "test@test.com",
                It.IsAny<string>(),
                It.IsAny<string>()), Times.Once);
        }

        [Fact]
        public async Task CensorJobAsync_InvalidStatus_ShouldThrowAppException()
        {
            var request = new CensorJobRequest { Status = JobStatus.Draft };
            await Assert.ThrowsAsync<AppException>(() => _service.CensorJobAsync(1, request, 2));
        }
        #endregion
    }

    // Helper extension to mock DbSet
    public static class MockDbSetHelper
    {
        public static Mock<DbSet<T>> BuildMockDbSet<T>(this IQueryable<T> source) where T : class
        {
            var mock = new Mock<DbSet<T>>();
            mock.As<IAsyncEnumerable<T>>()
                .Setup(m => m.GetAsyncEnumerator(It.IsAny<CancellationToken>()))
                .Returns(new TestAsyncEnumerator<T>(source.GetEnumerator()));
            mock.As<IQueryable<T>>()
                .Setup(m => m.Provider)
                .Returns(new TestAsyncQueryProvider<T>(source.Provider));
            mock.As<IQueryable<T>>().Setup(m => m.Expression).Returns(source.Expression);
            mock.As<IQueryable<T>>().Setup(m => m.ElementType).Returns(source.ElementType);
            mock.As<IQueryable<T>>().Setup(m => m.GetEnumerator()).Returns(source.GetEnumerator());
            return mock;
        }
    }

    internal class TestAsyncQueryProvider<TEntity> : IAsyncQueryProvider
    {
        private readonly IQueryProvider _inner;
        public TestAsyncQueryProvider(IQueryProvider inner) { _inner = inner; }

        public IQueryable CreateQuery(Expression expression) => new TestAsyncEnumerable<TEntity>(expression);

        public IQueryable<TElement> CreateQuery<TElement>(Expression expression) => new TestAsyncEnumerable<TElement>(expression);

        public object Execute(Expression expression) => _inner.Execute(expression);

        public TResult Execute<TResult>(Expression expression) => _inner.Execute<TResult>(expression);

        // EF Core 6+ expects Task<TResult> here
        public TResult ExecuteAsync<TResult>(Expression expression, CancellationToken cancellationToken)
        {
            // If TResult is Task<T>, unwrap and return completed task
            var resultType = typeof(TResult);
            if (resultType.IsGenericType && resultType.GetGenericTypeDefinition() == typeof(Task<>))
            {
                var innerResultType = resultType.GetGenericArguments()[0];
                var result = _inner.Execute(expression);
                return (TResult)typeof(Task)
                    .GetMethod(nameof(Task.FromResult))
                    .MakeGenericMethod(innerResultType)
                    .Invoke(null, new object[] { result });
            }

            // For Task (non-generic) return Task.CompletedTask
            return (TResult)(object)Task.CompletedTask;
        }
    }

    internal class TestAsyncEnumerable<T> : EnumerableQuery<T>, IAsyncEnumerable<T>, IQueryable<T>
    {
        public TestAsyncEnumerable(IEnumerable<T> enumerable) : base(enumerable) { }
        public TestAsyncEnumerable(Expression expression) : base(expression) { }
        public IAsyncEnumerator<T> GetAsyncEnumerator(CancellationToken cancellationToken = default) => new TestAsyncEnumerator<T>(this.AsEnumerable().GetEnumerator());
        IQueryProvider IQueryable.Provider => new TestAsyncQueryProvider<T>(this);
    }

    internal class TestAsyncEnumerator<T> : IAsyncEnumerator<T>
    {
        private readonly IEnumerator<T> _inner;
        public TestAsyncEnumerator(IEnumerator<T> inner) { _inner = inner; }
        public ValueTask DisposeAsync() { _inner.Dispose(); return default; }
        public ValueTask<bool> MoveNextAsync() => new ValueTask<bool>(_inner.MoveNext());
        public T Current => _inner.Current;
    }
}
