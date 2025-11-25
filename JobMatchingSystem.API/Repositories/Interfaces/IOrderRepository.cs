using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface IOrderRepository
    {
        Task CreateAsync(Order order);
        Task<Order?> GetByIdAsync(int id);
        Task<List<Order>> GetAllOrdersPagedAsync(GetOrderPagedRequest request);
    }
}
