using System.Text.Json.Serialization;
using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.DTOs.Response
{
    /// <summary>
    /// Response model for CV validation using AI
    /// </summary>
    public class CVValidationResponse
    {
        /// <summary>
        /// Whether the file is identified as a CV
        /// </summary>
        [JsonPropertyName("is_cv")]
        [Required]
        public bool IsCV { get; set; }
        
        /// <summary>
        /// Confidence score of the validation (0.0 to 1.0)
        /// </summary>
        [JsonPropertyName("confidence")]
        [Required]
        [Range(0.0, 1.0)]
        public double Confidence { get; set; }
        
        /// <summary>
        /// Reason for the validation result
        /// </summary>
        [JsonPropertyName("reason")]
        [Required]
        public string Reason { get; set; } = string.Empty;
        
        /// <summary>
        /// Additional file information
        /// </summary>
        [JsonPropertyName("file_info")]
        public CVFileInfo? FileInfo { get; set; }
    }

    /// <summary>
    /// File information for CV validation
    /// </summary>
    public class CVFileInfo
    {
        /// <summary>
        /// Original filename
        /// </summary>
        [JsonPropertyName("filename")]
        [Required]
        public string FileName { get; set; } = string.Empty;
        
        /// <summary>
        /// File size in megabytes
        /// </summary>
        [JsonPropertyName("file_size_mb")]
        [Required]
        public double FileSizeMB { get; set; }
        
        /// <summary>
        /// Number of pages in PDF (if available)
        /// </summary>
        [JsonPropertyName("num_pages")]
        public int? NumPages { get; set; }
        
        /// <summary>
        /// Length of extracted text (if available)
        /// </summary>
        [JsonPropertyName("text_length")]
        public int? TextLength { get; set; }
        
        /// <summary>
        /// Error message if processing failed
        /// </summary>
        [JsonPropertyName("error")]
        public string? Error { get; set; }
    }
}