using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Repositories.Interfaces;

namespace JobMatchingSystem.API.Repositories.Implementations
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        public IAuthRepository AuthRepository { get; private set; }
        public ICompanyRepository CompanyRepository { get; private set; }

        public UnitOfWork(ApplicationDbContext context,IAuthRepository authRepository,ICompanyRepository companyRepository) 
        {
            _context = context;
            AuthRepository = authRepository;
            CompanyRepository = companyRepository;
        }
        public async Task SaveAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
