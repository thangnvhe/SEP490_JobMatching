using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Enums;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly ApplicationDbContext _context;

        public OrderService(IOrderRepository orderRepository, ApplicationDbContext context)
        {
            _orderRepository = orderRepository;
            _context = context;
        }

        public async Task<OrderResponse> CreateOrderAsync(CreateOrderRequest request, int buyerId)
        {
            var service = await _context.ServicePlans
                .FirstOrDefaultAsync(x => x.Id == request.ServiceId);

            if (service == null)
                throw new AppException(ErrorCode.NotFoundServicePlan());

            var order = new Order
            {
                BuyerId = buyerId,
                ServiceId = request.ServiceId,
                Amount = service.Price,
                Status = OrderStatus.Pending,
            };

            // Lưu lần 1 để có OrderId
            await _orderRepository.CreateAsync(order);

            // Sinh 6 ký tự in hoa random
            string random = GenerateRandomString(6);

            // TransferContent = {OrderId}{6 char}
            order.TransferContent = $"{order.Id}{random}";

            // Lưu lại TransferContent
            await _context.SaveChangesAsync();

            // Trả về DTO
            return new OrderResponse
            {
                Id = order.Id,
                Amount = order.Amount,
                TransferContent = order.TransferContent,
                Status = order.Status.ToString(),
                BuyerId = order.BuyerId,
                ServiceId = order.ServiceId,
                CreatedAt = order.CreatedAt
            };
        }

        private string GenerateRandomString(int length)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        public async Task<PagedResult<OrderResponse>> GetOrdersPagedAsync(GetOrderPagedRequest request)
        {
            var orders = await _orderRepository.GetAllOrdersPagedAsync(request);

            if (orders == null || !orders.Any())
            {
                return new PagedResult<OrderResponse>
                {
                    Items = new List<OrderResponse>(),
                    pageInfo = new PageInfo(0, request.page, request.size, request.sortBy ?? "", request.isDescending)
                };
            }

            var pagedOrders = orders
                .Skip((request.page - 1) * request.size)
                .Take(request.size)
                .ToList();

            var orderDtos = pagedOrders.Select(o => new OrderResponse
            {
                Id = o.Id,
                Amount = o.Amount,
                TransferContent = o.TransferContent ?? "",
                Status = o.Status.ToString(),
                BuyerId = o.BuyerId,
                ServiceId = o.ServiceId,
                CreatedAt = o.CreatedAt
            }).ToList();

            return new PagedResult<OrderResponse>
            {
                Items = orderDtos,
                pageInfo = new PageInfo(orders.Count, request.page, request.size, request.sortBy ?? "", request.isDescending)
            };
        }
    }
}
