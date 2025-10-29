// Services/Interfaces/ICVTemplateService.cs
namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface ICVTemplateService
    {
        Task<byte[]> GenerateCVHtmlAsync(int userId, int templateId);
    }
}