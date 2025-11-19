using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Repositories.Interfaces;

namespace JobMatchingSystem.API.Repositories.Implementations
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        public IAuthRepository AuthRepository { get; private set; }
        public ICompanyRepository CompanyRepository { get; private set; }
        public ICandidateJobRepository CandidateJobRepository { get; private set; }
        public IJobRepository JobRepository { get; private set; }
        public ICvUploadRepository CvUploadRepository {  get; private set; }
        public ICandidateStageRepository CandidateStageRepository { get; private set; }
        public IJobStageRepository JobStageRepository { get; private set; }

        public UnitOfWork(ApplicationDbContext context,IAuthRepository authRepository,ICompanyRepository companyRepository, ICandidateJobRepository candidateJobRepository,
        IJobRepository jobRepository,
        ICvUploadRepository cvUploadRepository,
        ICandidateStageRepository candidateStageRepository,
        IJobStageRepository jobStageRepository) 
        {
            _context = context;
            AuthRepository = authRepository;
            CompanyRepository = companyRepository;
            CandidateJobRepository = candidateJobRepository;
            JobRepository = jobRepository;
            CvUploadRepository = cvUploadRepository;
            CandidateStageRepository = candidateStageRepository;
            JobStageRepository = jobStageRepository;
        }
        public async Task SaveAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
