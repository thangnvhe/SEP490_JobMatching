using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface ICvUploadRepository
    {
        Task<CVUpload?> GetById(int id);
    }
}
