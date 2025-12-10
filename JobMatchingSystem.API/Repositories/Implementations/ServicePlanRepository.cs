using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Repositories.Implementations
{
    public class ServicePlanRepository : IServicePlanRepository
    {
        private readonly ApplicationDbContext _context;

        public ServicePlanRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<ServicePlan>> GetAllAsync()
        {
            return await _context.ServicePlans.ToListAsync();
        }

        public async Task<ServicePlan?> GetByIdAsync(int id)
        {
            return await _context.ServicePlans
                                 .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task AddAsync(ServicePlan plan)
        {
            await _context.ServicePlans.AddAsync(plan);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(ServicePlan plan)
        {
            _context.ServicePlans.Remove(plan);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(ServicePlan plan)
        {
            _context.ServicePlans.Update(plan);
            await _context.SaveChangesAsync();
        }
    }
}
