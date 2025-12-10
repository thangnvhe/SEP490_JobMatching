using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;

namespace JobMatchingSystem.API.Repositories.Implementations
{
    public class CvUploadRepository : ICvUploadRepository
    {
        protected readonly ApplicationDbContext _context;
        public CvUploadRepository(ApplicationDbContext context) {
            _context = context;
        }
        public async Task<CVUpload?> GetById(int id)
        {
            return await _context.CVUploads.FindAsync(id);
        }
    }
}
