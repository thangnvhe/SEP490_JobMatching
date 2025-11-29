using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Services.Interfaces;

namespace JobMatchingSystem.API.Extensions
{
    public static class BlobStorageExtensions
    {
        /// <summary>
        /// Generate file URL with SAS token for secure access to private blobs
        /// </summary>
        /// <param name="blobStorage">Blob storage service</param>
        /// <param name="fileUrl">Full file URL</param>
        /// <param name="expiryHours">SAS token expiry hours (default: 24)</param>
        /// <returns>URL with SAS token or null if invalid URL</returns>
        public static async Task<string?> GetSecureFileUrlAsync(this IBlobStorageService blobStorage, string? fileUrl, int expiryHours = 24)
        {
            if (string.IsNullOrEmpty(fileUrl) || fileUrl == "Empty")
                return null;

            try
            {
                var (folder, fileName) = BlobStorageHelper.ExtractFolderAndFileNameFromUrl(fileUrl);
                
                if (string.IsNullOrEmpty(folder) || string.IsNullOrEmpty(fileName))
                    return fileUrl; // Return original URL if cannot parse
                
                return await blobStorage.GetFileUrlWithSasTokenAsync(folder, fileName, expiryHours);
            }
            catch
            {
                return fileUrl; // Return original URL if error
            }
        }
    }
}