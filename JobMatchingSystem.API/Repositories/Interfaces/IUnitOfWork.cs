namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface IUnitOfWork
    {
        IAuthRepository AuthRepository { get; }
        ICompanyRepository CompanyRepository { get; }
        ICandidateJobRepository CandidateJobRepository { get; }
        IJobRepository JobRepository { get; }
        ICvUploadRepository CvUploadRepository { get; }

        Task SaveAsync();
    }
}
