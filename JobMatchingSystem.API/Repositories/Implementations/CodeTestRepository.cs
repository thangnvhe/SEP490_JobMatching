using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Entities;
using JobMatchingSystem.API.Repositories.Interfaces;

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
    }
}
