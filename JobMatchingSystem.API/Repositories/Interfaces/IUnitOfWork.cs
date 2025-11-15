namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface IUnitOfWork
    {
        IAuthRepository AuthRepository { get; }
        ICompanyRepository CompanyRepository { get; }

        Task SaveAsync();
    }
}
