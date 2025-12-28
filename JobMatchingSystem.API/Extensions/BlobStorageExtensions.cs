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
        /// <returns>URL with SAS token or original URL if unable to generate SAS</returns>
        public static async Task<string?> GetSecureFileUrlAsync(this IBlobStorageService blobStorage, string? fileUrl, int expiryHours = 24)
        {
            if (string.IsNullOrEmpty(fileUrl) || fileUrl == "Empty")
                return null;

            try
            {
                var (folder, fileName) = BlobStorageHelper.ExtractFolderAndFileNameFromUrl(fileUrl);
                
                if (string.IsNullOrEmpty(folder) || string.IsNullOrEmpty(fileName))
                {
                    // If we can't parse the URL structure, return original URL
                    // This could be a direct URL that doesn't follow the expected pattern
                    return fileUrl;
                }
                
                // Try to get SAS token URL
                var sasUrl = await blobStorage.GetFileUrlWithSasTokenAsync(folder, fileName, expiryHours);
                return sasUrl;
            }
            catch (FileNotFoundException)
            {
                // File doesn't exist in blob storage, return original URL
                return fileUrl;
            }
            catch (Exception ex)
            {
                // Log the error and return original URL as fallback
                System.Diagnostics.Debug.WriteLine($"Error generating SAS URL for {fileUrl}: {ex.Message}");
                return fileUrl;
            }
        }
    }
}