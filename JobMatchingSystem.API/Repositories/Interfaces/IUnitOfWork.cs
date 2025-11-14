namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface IUnitOfWork
    {
        IAuthRepository AuthRepository { get; }

        Task SaveAsync();
    }
}
