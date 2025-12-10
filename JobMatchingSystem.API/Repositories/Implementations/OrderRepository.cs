using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Repositories.Implementations
{
    public class OrderRepository : IOrderRepository
    {
        private readonly ApplicationDbContext _context;

        public OrderRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task CreateAsync(Order order)
        {
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
        }

        public async Task<Order?> GetByIdAsync(int id)
        {
            return await _context.Orders.FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<Order>> GetAllOrdersPagedAsync(GetOrderPagedRequest request)
        {
            IQueryable<Order> query = _context.Orders.AsQueryable();

            // Filter theo các trường cụ thể
            if (request.id.HasValue)
                query = query.Where(o => o.Id == request.id.Value);

            if (request.amount.HasValue)
                query = query.Where(o => o.Amount == request.amount.Value);

            if (!string.IsNullOrEmpty(request.transferContent))
                query = query.Where(j => j.TransferContent.Contains(request.transferContent));

            if (!string.IsNullOrWhiteSpace(request.search))
            {
                var searchLower = request.search.ToLower();
                query = query.Where(r => r.TransferContent.ToLower().Contains(searchLower));
            }

            if (request.status.HasValue)
                query = query.Where(o => o.Status == request.status.Value);

            if (request.buyerId.HasValue)
                query = query.Where(o => o.BuyerId == request.buyerId.Value);

            if (request.serviceId.HasValue)
                query = query.Where(o => o.ServiceId == request.serviceId.Value);

            if (request.createMin.HasValue)
                query = query.Where(o => o.CreatedAt >= request.createMin.Value);

            if (request.createMax.HasValue)
                query = query.Where(o => o.CreatedAt <= request.createMax.Value);

            // Sắp xếp động
            if (!string.IsNullOrWhiteSpace(request.sortBy))
            {
                var propertyInfo = typeof(Order).GetProperty(request.sortBy);
                if (propertyInfo != null)
                {
                    query = request.isDescending
                        ? query.OrderByDescending(x => EF.Property<object>(x, request.sortBy))
                        : query.OrderBy(x => EF.Property<object>(x, request.sortBy));
                }
                else
                {
                    query = query.OrderBy(o => o.Id);
                }
            }
            else
            {
                query = query.OrderBy(o => o.Id);
            }

            return await query.ToListAsync();
        }
    }
}
