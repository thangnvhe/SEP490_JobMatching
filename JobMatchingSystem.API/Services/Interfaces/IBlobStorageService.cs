namespace JobMatchingSystem.API.Services.Interfaces
{
    public interface IBlobStorageService
    {
        /// <summary>
        /// Upload file to Azure Blob Storage
        /// </summary>
        /// <param name="file">File to upload</param>
        /// <param name="folder">Folder name (avatars, company-logos, cvs, licenses)</param>
        /// <param name="fileName">Optional custom file name (if null, will generate unique name)</param>
        /// <returns>File URL</returns>
        Task<string> UploadFileAsync(IFormFile file, string folder, string? fileName = null);

        /// <summary>
        /// Upload file from stream to Azure Blob Storage
        /// </summary>
        /// <param name="stream">File stream</param>
        /// <param name="folder">Folder name (avatars, company-logos, cvs, licenses)</param>
        /// <param name="fileName">File name</param>
        /// <param name="contentType">Content type (e.g., image/jpeg, application/pdf)</param>
        /// <returns>File URL</returns>
        Task<string> UploadFileAsync(Stream stream, string folder, string fileName, string contentType);

        /// <summary>
        /// Delete file from Azure Blob Storage
        /// </summary>
        /// <param name="fileUrl">Full URL of the file to delete</param>
        /// <returns>True if deleted successfully</returns>
        Task<bool> DeleteFileAsync(string fileUrl);

        /// <summary>
        /// Delete file by folder and fileName
        /// </summary>
        /// <param name="folder">Folder name</param>
        /// <param name="fileName">File name</param>
        /// <returns>True if deleted successfully</returns>
        Task<bool> DeleteFileAsync(string folder, string fileName);

        /// <summary>
        /// Get file URL with SAS token for private access
        /// </summary>
        /// <param name="folder">Folder name</param>
        /// <param name="fileName">File name</param>
        /// <param name="expiryHours">Token expiry time in hours (default: 24)</param>
        /// <returns>File URL with SAS token</returns>
        Task<string> GetFileUrlWithSasTokenAsync(string folder, string fileName, int expiryHours = 24);

        /// <summary>
        /// Check if file exists
        /// </summary>
        /// <param name="folder">Folder name</param>
        /// <param name="fileName">File name</param>
        /// <returns>True if file exists</returns>
        Task<bool> FileExistsAsync(string folder, string fileName);
    }
}