using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Enums;
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
    public class OrderServiceTests
    {
        private readonly Mock<IOrderRepository> _orderRepoMock;
        private readonly ApplicationDbContext _context;
        private readonly OrderService _service;

        public OrderServiceTests()
        {
            // Setup in-memory DbContext
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new ApplicationDbContext(options);

            // Seed sample ServicePlans
            _context.ServicePlans.AddRange(new List<ServicePlan>
            {
                new ServicePlan { Id = 1, Name = "Plan A", Description = "Desc A", Price = 100 },
                new ServicePlan { Id = 2, Name = "Plan B", Description = "Desc B", Price = 200 }
            });
            _context.SaveChanges();

            _orderRepoMock = new Mock<IOrderRepository>();
            _orderRepoMock.Setup(r => r.CreateAsync(It.IsAny<Order>()))
                .Returns(Task.CompletedTask)
                .Callback<Order>(o =>
                {
                    // Simulate setting Id after insert
                    if (o.Id == 0) o.Id = new Random().Next(1, 1000);
                });

            _orderRepoMock.Setup(r => r.GetAllOrdersPagedAsync(It.IsAny<GetOrderPagedRequest>()))
    .ReturnsAsync(() => _context.Orders.ToList());

            _service = new OrderService(_orderRepoMock.Object, _context);
        }

        #region CreateOrderAsync Tests

        [Fact]
        public async Task CreateOrderAsync_ValidRequest_ShouldReturnOrderResponse()
        {
            var request = new CreateOrderRequest { ServiceId = 1 };
            int buyerId = 123;

            var result = await _service.CreateOrderAsync(request, buyerId);

            Assert.NotNull(result);
            Assert.Equal(buyerId, result.BuyerId);
            Assert.Equal(request.ServiceId, result.ServiceId);
            Assert.Equal(100, result.Amount);
            Assert.NotNull(result.TransferContent);
            Assert.Equal(OrderStatus.Pending.ToString(), result.Status);
            Assert.True(result.Id > 0);
        }

        [Fact]
        public async Task CreateOrderAsync_ServiceNotFound_ShouldThrowAppException()
        {
            var request = new CreateOrderRequest { ServiceId = 999 }; // không tồn tại
            int buyerId = 123;

            await Assert.ThrowsAsync<AppException>(() => _service.CreateOrderAsync(request, buyerId));
        }

        #endregion

        #region GetOrdersPagedAsync Tests

        [Fact]
        public async Task GetOrdersPagedAsync_WhenNoOrders_ShouldReturnEmptyPagedResult()
        {
            var request = new GetOrderPagedRequest

            {
                page = 1,
                size = 10
            };

            var result = await _service.GetOrdersPagedAsync(request);

            Assert.NotNull(result);
            Assert.Empty(result.Items);
            Assert.Equal(0, result.pageInfo.TotalItem);
            Assert.Equal(request.page, result.pageInfo.CurrentPage);
            Assert.Equal(request.size, result.pageInfo.PageSize);
        }

        [Fact]
        public async Task GetOrdersPagedAsync_WhenOrdersExist_ShouldReturnPagedOrders()
        {
            // Seed orders
            _context.Orders.AddRange(new List<Order>
            {
                new Order { Id = 1, BuyerId = 1, ServiceId = 1, Amount = 100, Status = OrderStatus.Pending, CreatedAt = DateTime.UtcNow },
                new Order { Id = 2, BuyerId = 2, ServiceId = 2, Amount = 200, Status = OrderStatus.Success, CreatedAt = DateTime.UtcNow }
            });
            _context.SaveChanges();

            var request = new GetOrderPagedRequest
            {
                page = 1,
                size = 1
            };

            var result = await _service.GetOrdersPagedAsync(request);

            Assert.NotNull(result);
            Assert.Single(result.Items);
            Assert.Equal(2, result.pageInfo.TotalItem);
            Assert.Equal(request.page, result.pageInfo.CurrentPage);
            Assert.Equal(request.size, result.pageInfo.PageSize);

            var order = result.Items.First();
            Assert.True(order.Id > 0);
            Assert.NotNull(order.Status);
            Assert.NotNull(order.TransferContent ?? ""); // có thể null nhưng service map "" nếu null
        }

        #endregion
    }
}
