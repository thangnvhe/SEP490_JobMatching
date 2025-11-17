using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Repositories.Implementations
{
    public class CVCertificateRepository : ICVCertificateRepository
    {
        private readonly ApplicationDbContext _context;

        public CVCertificateRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<CVCertificate?> GetByIdAsync(int id)
        {
            return await _context.CVCertificates
                                 .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<List<CVCertificate>> GetByUserIdAsync(int userId)
        {
            return await _context.CVCertificates
                                 .Where(c => c.UserId == userId)
                                 .ToListAsync();
        }

        public async Task CreateAsync(CVCertificate certificate)
        {
            _context.CVCertificates.Add(certificate);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(CVCertificate certificate)
        {
            _context.CVCertificates.Update(certificate);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(CVCertificate certificate)
        {
            _context.CVCertificates.Remove(certificate);
            await _context.SaveChangesAsync();
        }
    }
}
