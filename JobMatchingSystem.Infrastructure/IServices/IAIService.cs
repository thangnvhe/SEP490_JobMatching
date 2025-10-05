using JobMatchingSystem.Infrastructure.Models;
using Microsoft.AspNetCore.Http;

namespace JobMatchingSystem.Infrastructure.IServices
{
    public interface IAIService
    {
        /// <summary>
        /// Phân tích CV từ file PDF và trích xuất thông tin
        /// </summary>
        /// <param name="pdfFile">File PDF CV</param>
        /// <returns>Kết quả phân tích CV</returns>
        Task<CVAnalysisResult> AnalyzeCVFromPDFAsync(IFormFile pdfFile);

        /// <summary>
        /// Phân tích CV từ text đã được trích xuất
        /// </summary>
        /// <param name="cvText">Nội dung text của CV</param>
        /// <returns>Kết quả phân tích CV</returns>
        Task<CVAnalysisResult> AnalyzeCVFromTextAsync(string cvText);

        /// <summary>
        /// Xuất kết quả phân tích CV ra file Excel
        /// </summary>
        /// <param name="analysisResults">Danh sách kết quả phân tích</param>
        /// <returns>Byte array của file Excel</returns>
        Task<byte[]> ExportCVAnalysisToExcelAsync(List<CVAnalysisResult> analysisResults);

        /// <summary>
        /// Trích xuất text từ file PDF
        /// </summary>
        /// <param name="pdfFile">File PDF</param>
        /// <returns>Nội dung text</returns>
        Task<string> ExtractTextFromPDFAsync(IFormFile pdfFile);
    }
}