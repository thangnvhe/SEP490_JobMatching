namespace JobMatchingSystem.API.Helpers
{
    public static class BlobStorageHelper
    {
        /// <summary>
        /// Extract file name from blob URL
        /// </summary>
        /// <param name="fileUrl">Full blob URL</param>
        /// <returns>File name without folder path</returns>
        public static string? ExtractFileNameFromUrl(string fileUrl)
        {
            if (string.IsNullOrEmpty(fileUrl))
                return null;

            try
            {
                var uri = new Uri(fileUrl);
                var segments = uri.AbsolutePath.Split('/');
                return segments.Last(); // Return the last segment (filename)
            }
            catch
            {
                return null;
            }
        }

        /// <summary>
        /// Extract folder and file name from blob URL
        /// </summary>
        /// <param name="fileUrl">Full blob URL</param>
        /// <returns>Tuple of (folder, fileName)</returns>
        public static (string? folder, string? fileName) ExtractFolderAndFileNameFromUrl(string fileUrl)
        {
            if (string.IsNullOrEmpty(fileUrl))
                return (null, null);

            try
            {
                var uri = new Uri(fileUrl);
                var path = uri.AbsolutePath.TrimStart('/');
                
                // Remove container name if present
                var pathParts = path.Split('/');
                if (pathParts.Length >= 3) // container/folder/filename
                {
                    var folder = pathParts[1];
                    var fileName = pathParts[2];
                    return (folder, fileName);
                }
                else if (pathParts.Length == 2) // folder/filename
                {
                    var folder = pathParts[0];
                    var fileName = pathParts[1];
                    return (folder, fileName);
                }
                
                return (null, null);
            }
            catch
            {
                return (null, null);
            }
        }

        /// <summary>
        /// Generate unique file name with timestamp
        /// </summary>
        /// <param name="originalFileName">Original file name with extension</param>
        /// <param name="prefix">Optional prefix</param>
        /// <returns>Unique file name</returns>
        public static string GenerateUniqueFileName(string originalFileName, string? prefix = null)
        {
            var extension = Path.GetExtension(originalFileName);
            var nameWithoutExtension = Path.GetFileNameWithoutExtension(originalFileName);
            var timestamp = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss");
            var uniqueId = Guid.NewGuid().ToString("N")[..8]; // First 8 characters of GUID

            var fileName = prefix != null
                ? $"{prefix}_{nameWithoutExtension}_{timestamp}_{uniqueId}{extension}"
                : $"{nameWithoutExtension}_{timestamp}_{uniqueId}{extension}";

            return fileName;
        }

        /// <summary>
        /// Validate file type for specific folder
        /// </summary>
        /// <param name="fileName">File name with extension</param>
        /// <param name="folder">Target folder</param>
        /// <returns>True if file type is allowed</returns>
        public static bool IsValidFileType(string fileName, string folder)
        {
            var extension = Path.GetExtension(fileName)?.ToLower();
            if (string.IsNullOrEmpty(extension))
                return false;

            var allowedExtensions = folder.ToLower() switch
            {
                "avartars" => new[] { ".jpg", ".jpeg", ".png", ".gif" },
                "company-logos" => new[] { ".jpg", ".jpeg", ".png", ".gif", ".svg" },
                "cvs" => new[] { ".pdf", ".doc", ".docx" },
                "licenses" => new[] { ".pdf", ".jpg", ".jpeg", ".png" },
                _ => new string[] { }
            };

            return allowedExtensions.Contains(extension);
        }

        /// <summary>
        /// Get content type from file extension
        /// </summary>
        /// <param name="fileName">File name with extension</param>
        /// <returns>Content type</returns>
        public static string GetContentType(string fileName)
        {
            var extension = Path.GetExtension(fileName)?.ToLower();
            
            return extension switch
            {
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".svg" => "image/svg+xml",
                ".pdf" => "application/pdf",
                ".doc" => "application/msword",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                _ => "application/octet-stream"
            };
        }
    }
}