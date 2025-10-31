using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Entities;
using JobMatchingSystem.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Repositories.Implementations
{
    public class CodeTestRepository : ICodeTestRepository
    {
        protected readonly ApplicationDbContext _context;
        public CodeTestRepository(ApplicationDbContext context) {
            _context = context;
        }
        public async Task CreateCodeTest(CodeTestCase codeTestCase)
        {
            _context.Add(codeTestCase);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteCodeTest(CodeTestCase codeTestCase)
        {
            codeTestCase!.isDelete = true;
            await _context.SaveChangesAsync(true);
        }

        public async Task<List<CodeTestCase>> GetAllCodeTestCases()
        {
            return await _context.CodeTestCases.ToListAsync();
        }

        public async Task<List<CodeTestCase>> GetAllTestCaseByCodeID(int codeID)
        {
            return await _context.CodeTestCases.Where(x=>x.CodeId == codeID).ToListAsync();
        }

        public async Task<CodeTestCase?> GetTestCaseById(int id)
        {
            return await _context.CodeTestCases.FindAsync(id); 
        }

        public async Task UpdateCodeTest(CodeTestCase codeTestCase)
        {
            _context.Update(codeTestCase);
            await _context.SaveChangesAsync();
        }
    }
}
