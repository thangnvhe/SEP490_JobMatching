using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Entities;
using JobMatchingSystem.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Repositories.Implementations
{
    public class CodeRepository : ICodeRepository
    {
        protected readonly ApplicationDbContext _context;
        public CodeRepository(ApplicationDbContext context) {
        _context = context;
        }

        public async Task CreateCode(Code code)
        {
            _context.Codes.Add(code);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Code>> GetAllCode()
        {
            return await _context.Codes.Where(x=>!x.IsDeleted).ToListAsync();
        }

        public async Task<Code?> GetCodeById(int id)
        {
            return await _context.Codes.FindAsync(id);
        }

        public async Task SoftDeleteCode(int codeId)
        {
            var codeDelete=await _context.Codes.FindAsync(codeId);
            codeDelete.IsDeleted = true;
            await _context.SaveChangesAsync();
        }

        public async Task UpdateCode(Code code)
        {
            _context.Codes.Update(code);
            await _context.SaveChangesAsync();
        }
    }
}
