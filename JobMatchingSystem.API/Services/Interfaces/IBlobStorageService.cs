namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface IBlobStorageService
    {
        Task<string> UploadFileAsync(IFormFile file, string containerName);
        Task DeleteFileAsync(string fileUrl, string containerName);
    }
}