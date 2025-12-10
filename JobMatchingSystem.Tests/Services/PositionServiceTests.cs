using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Implementations;
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
    public class PositionServiceTests
    {
        private readonly PositionService _service;
        private readonly Mock<IPositionRepository> _positionRepoMock;
        private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;
        private readonly ApplicationDbContext _context;

        public PositionServiceTests()
        {
            _positionRepoMock = new Mock<IPositionRepository>();

            var store = new Mock<IUserStore<ApplicationUser>>();
            _userManagerMock = new Mock<UserManager<ApplicationUser>>(
                store.Object, null, null, null, null, null, null, null, null);

            // Dùng InMemoryDatabase cho DbContext
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDB_" + Guid.NewGuid())
                .Options;
            _context = new ApplicationDbContext(options);

            _service = new PositionService(_positionRepoMock.Object, _userManagerMock.Object, _context);
        }

        [Fact]
        public async Task GetAllAsync_ShouldReturnAllPositionsMapped()
        {
            var positions = new List<Position>
            {
                new Position { PositionId = 1, Name = "Dev" },
                new Position { PositionId = 2, Name = "QA" }
            };
            _positionRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(positions);

            var result = await _service.GetAllAsync();

            Assert.Equal(2, result.Count());
            Assert.Contains(result, p => p.Name == "Dev");
            Assert.Contains(result, p => p.Name == "QA");
        }

        [Fact]
        public async Task GetAllPagedAsync_ShouldReturnPagedResult()
        {
            _context.Positions.AddRange(
                new Position { PositionId = 1, Name = "Dev" },
                new Position { PositionId = 2, Name = "QA" },
                new Position { PositionId = 3, Name = "PM" }
            );
            await _context.SaveChangesAsync();

            var result = await _service.GetAllPagedAsync(page: 1, pageSize: 2, sortBy: "name");

            Assert.Equal(2, result.Items.Count);
            Assert.Equal(3, result.pageInfo.TotalItem);
        }

        [Fact]
        public async Task GetByIdAsync_ValidId_ShouldReturnPosition()
        {
            var position = new Position { PositionId = 1, Name = "Dev" };
            _positionRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(position);

            var result = await _service.GetByIdAsync(1);

            Assert.Equal(1, result.PositionId);
            Assert.Equal("Dev", result.Name);
        }

        [Fact]
        public async Task GetByIdAsync_InvalidId_ShouldThrowAppException()
        {
            _positionRepoMock.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((Position)null);

            await Assert.ThrowsAsync<AppException>(() => _service.GetByIdAsync(99));
        }

        [Fact]
        public async Task CreateAsync_ValidPositionId_ShouldReturnPositionResponse()
        {
            var position = new Position { PositionId = 1, Name = "Dev" };
            _positionRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(position);

            var result = await _service.CreateAsync(1, 1);

            Assert.Equal(1, result.PositionId);
            Assert.Equal("Dev", result.Name);
        }

        [Fact]
        public async Task CreateAsync_InvalidPositionId_ShouldThrowAppException()
        {
            _positionRepoMock.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((Position)null);

            await Assert.ThrowsAsync<AppException>(() => _service.CreateAsync(1, 99));
        }

        [Fact]
        public async Task UpdateCandidatePositionAsync_ShouldCreateOrUpdateCVProfile()
        {
            var candidate = new ApplicationUser { Id = 1, UserName = "testuser" };
            _userManagerMock.Setup(u => u.FindByIdAsync("1")).ReturnsAsync(candidate);

            var position = new Position { PositionId = 1, Name = "Dev" };
            _positionRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(position);

            // Chưa có CVProfile
            await _service.UpdateCandidatePositionAsync(1, 1);
            var cvProfile = await _context.CVProfiles.FirstOrDefaultAsync(cp => cp.UserId == 1);
            Assert.NotNull(cvProfile);
            Assert.Equal(1, cvProfile.PositionId);

            // Cập nhật CVProfile
            await _service.UpdateCandidatePositionAsync(1, 1);
            var updatedCVProfile = await _context.CVProfiles.FirstOrDefaultAsync(cp => cp.UserId == 1);
            Assert.Equal(1, updatedCVProfile.PositionId);
        }

        [Fact]
        public async Task CreatePositionAsync_ShouldCallRepositoryCreate()
        {
            var request = new CreatePositionRequest { Name = "Dev" };
            var createdPosition = new Position { PositionId = 1, Name = "Dev" };
            _positionRepoMock.Setup(r => r.CreateAsync(It.IsAny<Position>())).ReturnsAsync(createdPosition);

            var result = await _service.CreatePositionAsync(request);

            Assert.Equal(1, result.PositionId);
            Assert.Equal("Dev", result.Name);
        }

        [Fact]
        public async Task UpdatePositionAsync_ShouldUpdateAndReturn()
        {
            var existing = new Position { PositionId = 1, Name = "Old" };
            _positionRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(existing);
            _positionRepoMock.Setup(r => r.UpdateAsync(existing)).ReturnsAsync(existing);

            var request = new UpdatePositionRequest { Name = "New" };
            var result = await _service.UpdatePositionAsync(1, request);

            Assert.Equal("New", result.Name);
        }

        [Fact]
        public async Task UpdatePositionAsync_InvalidId_ShouldThrow()
        {
            _positionRepoMock.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((Position)null);
            var request = new UpdatePositionRequest { Name = "New" };

            await Assert.ThrowsAsync<AppException>(() => _service.UpdatePositionAsync(99, request));
        }

        [Fact]
        public async Task DeletePositionAsync_ShouldCallRepositoryDelete()
        {
            var existing = new Position { PositionId = 1, Name = "Dev" };
            _positionRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(existing);

            await _service.DeletePositionAsync(1);

            _positionRepoMock.Verify(r => r.DeleteAsync(1), Times.Once);
        }

        [Fact]
        public async Task DeletePositionAsync_InvalidId_ShouldThrow()
        {
            _positionRepoMock.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((Position)null);

            await Assert.ThrowsAsync<AppException>(() => _service.DeletePositionAsync(99));
        }
    }
}
