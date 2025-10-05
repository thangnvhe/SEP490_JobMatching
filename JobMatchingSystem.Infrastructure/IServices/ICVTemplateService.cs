using JobMatchingSystem.Infrastructure.Models;

namespace JobMatchingSystem.Infrastructure.IServices
{
    public interface ICVTemplateService
    {
        /// <summary>
        /// Lấy danh sách tất cả templates có sẵn
        /// </summary>
        /// <returns>Danh sách CV templates</returns>
        Task<List<CVTemplate>> GetAvailableTemplatesAsync();

        /// <summary>
        /// Lấy thông tin chi tiết của một template
        /// </summary>
        /// <param name="templateId">ID của template</param>
        /// <returns>Thông tin template</returns>
        Task<CVTemplate?> GetTemplateByIdAsync(string templateId);

        /// <summary>
        /// Tạo CV từ template và dữ liệu người dùng
        /// </summary>
        /// <param name="templateId">ID template</param>
        /// <param name="cvData">Dữ liệu CV của người dùng</param>
        /// <returns>Kết quả tạo CV (image bytes)</returns>
        Task<CVGenerationResult> GenerateCVFromTemplateAsync(string templateId, CVTemplateData cvData);

        /// <summary>
        /// Lấy preview template (template gốc không có dữ liệu)
        /// </summary>
        /// <param name="templateId">ID template</param>
        /// <returns>Image bytes của template preview</returns>
        Task<byte[]?> GetTemplatePreviewAsync(string templateId);

        /// <summary>
        /// Tạo CV với dữ liệu mẫu để demo
        /// </summary>
        /// <param name="templateId">ID template</param>
        /// <returns>CV với dữ liệu mẫu</returns>
        Task<CVGenerationResult> GenerateSampleCVAsync(string templateId);

        /// <summary>
        /// Validate template data trước khi tạo CV
        /// </summary>
        /// <param name="cvData">Dữ liệu cần validate</param>
        /// <returns>Kết quả validation và danh sách lỗi</returns>
        Task<(bool IsValid, List<string> Errors)> ValidateCVDataAsync(CVTemplateData cvData);
    }
}